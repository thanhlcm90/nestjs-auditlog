import test, { ExecutionContext } from 'ava';
import safeGot from 'got';
import sinon from 'sinon';

import {
  AuditLoggerDefaultExporter,
  AuditLogModule,
  AuditLogService,
  IAuditLogExporter,
  TraceModule,
  TraceOtlpGrpcExporter,
} from '../src';
import {
  DEFAULT_UNKNOWN_VALUE,
  OperationStatus,
} from '../src/lib/modules/audit-log/constant';

import { TestModule } from './app/test-module';
import { TestService } from './app/test-service';
import type { NestJSTestingServerFactory } from './helpers/types';

const got = safeGot.extend({
  https: {
    rejectUnauthorized: false,
  },
});

const delay = (second) =>
  new Promise((resolve) => setTimeout(resolve, second * 1000));

export const createTests = (
  createNestJSTestingServer: NestJSTestingServerFactory,
  rootTitle: string,
  auditLogExporter?: IAuditLogExporter,
  additionalExpect?: (t: ExecutionContext) => void
): void => {
  const auditLogDefault = {
    resource: { id: '1', type: DEFAULT_UNKNOWN_VALUE },
    operation: {
      id: 'createTheCatDefault1',
      type: DEFAULT_UNKNOWN_VALUE,
      status: OperationStatus.SUCCEEDED,
    },
    actor: {
      id: DEFAULT_UNKNOWN_VALUE,
      type: DEFAULT_UNKNOWN_VALUE,
      agent: 'got (https://github.com/sindresorhus/got)',
    },
  };
  const auditLog1 = {
    resource: { id: '1', type: 'Cat' },
    operation: {
      id: 'findTheCat',
      type: 'Query',
      status: OperationStatus.SUCCEEDED,
    },
    actor: {
      id: DEFAULT_UNKNOWN_VALUE,
      type: DEFAULT_UNKNOWN_VALUE,
      agent: 'got (https://github.com/sindresorhus/got)',
    },
  };
  const auditLog2 = {
    resource: { id: '1', type: 'Cat' },
    operation: {
      id: 'createTheCat',
      type: 'Create',
      status: OperationStatus.SUCCEEDED,
    },
    actor: {
      id: DEFAULT_UNKNOWN_VALUE,
      type: DEFAULT_UNKNOWN_VALUE,
      agent: 'got (https://github.com/sindresorhus/got)',
    },
  };
  const auditLog3 = {
    resource: { id: '1', type: 'Cat' },
    operation: {
      id: 'findTheCat',
      type: 'Query',
      status: OperationStatus.FAILED,
    },
    actor: {
      id: DEFAULT_UNKNOWN_VALUE,
      type: DEFAULT_UNKNOWN_VALUE,
      agent: 'got (https://github.com/sindresorhus/got)',
    },
  };
  const auditLog4 = {
    resource: { id: '1', type: 'Cat' },
    operation: {
      id: 'createTheCat',
      type: 'Create',
      status: OperationStatus.SUCCEEDED,
    },
    actor: {
      id: 'daniel',
      type: 'admin',
      agent: 'got (https://github.com/sindresorhus/got)',
    },
  };

  function removeIp(args) {
    return args.map((data) => {
      const newActor = { ...data.actor };
      delete newActor.ip;

      return {
        ...data,
        actor: newActor,
      };
    });
  }

  test(`${rootTitle} - should work normally after setting up the library (using".forRoot()")`, async (t) => {
    const exporter = auditLogExporter.clone();
    const traceExporter = new TraceOtlpGrpcExporter('test', 'test', {
      url: '127.0.0.1:4317',
    });
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
      traceModule: TraceModule.forRoot({
        exporter: traceExporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got(`${url}?id=1`);

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual.skip(stub.firstCall.args, [auditLog1]);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog1]);
    t.is(response.body, 'Congratulations! You have found the cat 1!');
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should work normally after setting up the library (using".forRootAsync()")`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRootAsync({
        imports: [TestModule],
        inject: [TestService],
        useFactory: async (_catsService: TestService) => {
          await delay(1);
          return {
            exporter,
          };
        },
      }),
      traceModule: TraceModule.forRootAsync({
        imports: [TestModule],
        inject: [TestService],
        useFactory: async (_catsService: TestService) => {
          await delay(1);
          return {
            exporter: null,
          };
        },
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got(`${url}?id=1`);

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog1]);
    t.is(response.body, 'Congratulations! You have found the cat 1!');
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with empty configuration`, async (t) => {
    const exporter = auditLogExporter.clone();
    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({ exporter }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got(`${url}?id=1`);

    t.true(httpServer.listening);
    t.is(response.body, 'Congratulations! You have found the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with empty options case 1 (operation id will be set default is method name)`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/default1`, { json: { id: '1' } });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLogDefault]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with empty options case 2 (operation id will be set default is method name)`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/default2`, { json: { id: '1' } });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLogDefault,
        operation: {
          ...auditLogDefault.operation,
          id: 'createTheCatDefault2',
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with empty options (all unknown values)`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/default3`, { json: { id: '1' } });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLogDefault,
        operation: {
          ...auditLogDefault.operation,
          id: DEFAULT_UNKNOWN_VALUE,
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with @AuditLogCreate (case 1)`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/default/create1`, {
      json: { id: '1' },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLogDefault,
        operation: {
          ...auditLogDefault.operation,
          id: 'createTheCatWithAuditLogCreate1',
          type: 'Create',
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with @AuditLogCreate (case 2)`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/default/create2`, {
      json: { id: '1' },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLogDefault,
        operation: {
          ...auditLogDefault.operation,
          id: 'createTheCatWithAuditLogCreate2',
          type: 'Create',
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with @AuditLogUpdate (case 1)`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/default/update1`, {
      json: { id: '1' },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLogDefault,
        operation: {
          ...auditLogDefault.operation,
          id: 'createTheCatWithAuditLogUpdate1',
          type: 'Update',
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with @AuditLogUpdate (case 2)`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/default/update2`, {
      json: { id: '1' },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLogDefault,
        operation: {
          ...auditLogDefault.operation,
          id: 'createTheCatWithAuditLogUpdate2',
          type: 'Update',
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with @AuditLogRemove (case 1)`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/default/remove1`, {
      json: { id: '1' },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLogDefault,
        operation: {
          ...auditLogDefault.operation,
          id: 'createTheCatWithAuditLogRemove1',
          type: 'Remove',
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with @AuditLogRemove (case 2)`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/default/remove2`, {
      json: { id: '1' },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLogDefault,
        operation: {
          ...auditLogDefault.operation,
          id: 'createTheCatWithAuditLogRemove2',
          type: 'Remove',
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with @AuditLogQuery (case 1)`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/default/query1`, {
      json: { id: '1' },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLogDefault,
        operation: {
          ...auditLogDefault.operation,
          id: 'createTheCatWithAuditLogQuery1',
          type: 'Query',
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with @AuditLogQuery (case 2)`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/default/query2`, {
      json: { id: '1' },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLogDefault,
        operation: {
          ...auditLogDefault.operation,
          id: 'createTheCatWithAuditLogQuery2',
          type: 'Query',
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with resource_id_field_map from body`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(url, { json: { id: '1' } });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog2]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with resource_id_field_map from params`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/create/1`);

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog2]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with default resource_id_field_map`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/another`, { json: { id: '1' } });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog2]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with fixed resource_id`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/fixed`);

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog2]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with resource_id is unknow`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/unknown`);

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLog2,
        resource: {
          ...auditLog2.resource,
          id: DEFAULT_UNKNOWN_VALUE,
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat unknown!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with actor from body`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/actor/actor_id_field_map`, {
      json: { id: '1', username: 'daniel', role: 'admin' },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog4]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with compare data`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/compare-data`, {
      json: { id: '1', username: 'daniel', role: 'admin' },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLog4,
        data_diff: {
          before: { name: 'cat 1' },
          after: { name: 'cat 2' },
          diff: {
            name: {
              __new: 'cat 2',
              __old: 'cat 1',
            },
          },
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with actor from guard`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/actor/guard`, {
      json: { id: '1' },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog4]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log by using AuditLogService`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/audit-with-service`, {
      json: { id: '1' },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog4]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with grpc exporter`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({ exporter: exporter }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got(`${url}?id=1`);

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog1]);
    t.is(response.body, 'Congratulations! You have found the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should NOT send audit log without decorator`, async (t) => {
    const exporter = new AuditLoggerDefaultExporter();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({ exporter: exporter }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got(`${url}/no-audit?id=1`);

    t.true(httpServer.listening);
    t.false(stub.called);
    t.is(response.body, 'Congratulations! You have found the cat 1!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with FAILED status`, async (t) => {
    const exporter = new AuditLoggerDefaultExporter();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({ exporter: exporter }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = got(`${url}/failed?id=1`);

    t.true(httpServer.listening);
    await t.throwsAsync(response);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog3]);
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should NOT send audit log with FAILED status`, async (t) => {
    const exporter = new AuditLoggerDefaultExporter();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({ exporter: exporter }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = got(`${url}/failed-no-audit?id=1`);

    t.true(httpServer.listening);
    await t.throwsAsync(response);
    t.false(stub.called);
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log by using AuditLogService with fixed resource_id`, async (t) => {
    const exporter = auditLogExporter.clone();
    const sub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, cleanupNestJSApp, app } = testingServer;
    const auditLogService = app.get(AuditLogService);
    auditLogService.sendAuditLog(auditLog4);

    t.true(httpServer.listening);
    t.true(sub.called);
    t.deepEqual(sub.firstCall.args, [auditLog4]);
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with real opentelemetry grpc exporter`, async (t) => {
    const exporter = auditLogExporter.clone();
    const exporterStub = sinon.stub(exporter, 'shutdown');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(url, { json: { id: '1' } });

    t.true(httpServer.listening);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    await cleanupNestJSApp();
    additionalExpect?.(t);
    t.true(exporterStub.called);
  });

  test(`${rootTitle} - should send audit log with real opentelemetry http exporter`, async (t) => {
    const exporter = auditLogExporter.clone();
    const exporterStub = sinon.stub(exporter, 'shutdown');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(url, { json: { id: '1' } });

    t.true(httpServer.listening);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    await cleanupNestJSApp();
    additionalExpect?.(t);
    t.true(exporterStub.called);
  });

  test(`${rootTitle} - should send audit log with field mapping from response`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/map-response`);

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [
      {
        ...auditLog2,
        resource: {
          ...auditLog2.resource,
          id: '2',
        },
        actor: {
          ...auditLog2.actor,
          id: '2',
          type: 'admin',
        },
      },
    ]);
    t.deepEqual(
      response.body,
      JSON.stringify({
        id: '2',
        role: 'admin',
      })
    );
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });

  test(`${rootTitle} - should send audit log with id from array string`, async (t) => {
    const exporter = auditLogExporter.clone();
    const stub = sinon.stub(exporter, 'sendAuditLog');
    stub.onCall(1).callsFake((log) => {
      return exporter.customLoggerBodyTransformation(log);
    });

    const testingServer = await createNestJSTestingServer({
      auditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/array-id`, {
      json: { id: ['1', '2'] },
    });

    t.true(httpServer.listening);
    t.true(stub.called);
    const stubArgs = stub.firstCall.args;
    t.deepEqual(removeIp(stubArgs), [
      {
        ...auditLog2,
        resource: {
          ...auditLog2.resource,
          id: ['1', '2'],
        },
      },
    ]);
    t.is(
      stub(stubArgs[0]),
      'The actor unknown unknown did the operator Create createTheCat on the resource Cat 1,2'
    );
    t.is(response.body, 'Congratulations! You created the cat 1,2!');
    additionalExpect?.(t);
    await cleanupNestJSApp();
  });
};
