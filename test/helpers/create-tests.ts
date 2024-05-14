import test from 'ava';
import safeGot from 'got';
import sinon from 'sinon';

import {
  AuditLogModule,
  AuditLogService,
  AuditLoggerDefaultExporter,
  OpenTelemetryGrpcExporter,
  OpenTelemetryHttpExporter,
} from '../../src';

import { CatsModule } from './test-module';
import { CatsService } from './test-service';
import type { NestJSTestingServerFactory } from './types';
import { Logger } from '@nestjs/common';

const got = safeGot.extend({
  https: {
    rejectUnauthorized: false,
  },
});

const delay = (second) =>
  new Promise((resolve) => setTimeout(resolve, second * 1000));

export const createTests = (
  createNestJSTestingServer: NestJSTestingServerFactory
): void => {
  const auditLog1 = {
    resource: { id: '1', type: 'Cat' },
    operation: {
      id: 'findTheCat',
      type: 'Query',
      status: 'SUCCEEDED',
    },
    actor: {
      id: 'unknown',
      type: 'unknown',
      agent: 'got (https://github.com/sindresorhus/got)',
    },
  };
  const auditLog2 = {
    resource: { id: '1', type: 'Cat' },
    operation: {
      id: 'createTheCat',
      type: 'Create',
      status: 'SUCCEEDED',
    },
    actor: {
      id: 'unknown',
      type: 'unknown',
      agent: 'got (https://github.com/sindresorhus/got)',
    },
  };
  const auditLog3 = {
    resource: { id: '1', type: 'Cat' },
    operation: {
      id: 'findTheCat',
      type: 'Query',
      status: 'FAILED',
    },
    actor: {
      id: 'unknown',
      type: 'unknown',
      agent: 'got (https://github.com/sindresorhus/got)',
    },
  };
  const auditLog4 = {
    resource: { id: '1', type: 'Cat' },
    operation: {
      id: 'createTheCat',
      type: 'Create',
      status: 'SUCCEEDED',
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

  test('should work normally after setting up the library (using`.forRoot()`)', async (t) => {
    const exporter = new OpenTelemetryHttpExporter(
      'test',
      'test',
      '127.0.0.1:4318'
    );
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({
        exporter,
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

  test('should work normally after setting up the library (using`.forRootAsync()`)', async (t) => {
    const exporter = new OpenTelemetryHttpExporter(
      'test',
      'test',
      '127.0.0.1:4318'
    );
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRootAsync({
        imports: [CatsModule],
        inject: [CatsService],
        useFactory: async (_catsService: CatsService) => {
          await delay(1);
          return {
            exporter,
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

  test('should send audit log with empty configuration and default exporter', async (t) => {
    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot(),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got(`${url}?id=1`);

    t.true(httpServer.listening);
    t.is(response.body, 'Congratulations! You have found the cat 1!');
    await cleanupNestJSApp();
  });

  test('should send audit log with empty configuration and default exporter, different logger', async (t) => {
    const logger: Logger = new Logger('Test');
    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({
        exporter: new AuditLoggerDefaultExporter(logger),
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got(`${url}?id=1`);

    t.true(httpServer.listening);
    t.is(response.body, 'Congratulations! You have found the cat 1!');
    await cleanupNestJSApp();
  });

  test('should send audit log with resource_id_field_map from body', async (t) => {
    const exporter = new OpenTelemetryHttpExporter(
      'test',
      'test',
      '127.0.0.1:4318'
    );
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({
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

  test('should send audit log with default resource_id_field_map', async (t) => {
    const exporter = new OpenTelemetryHttpExporter(
      'test',
      'test',
      '127.0.0.1:4318'
    );
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/another`, { json: { id: '1' } });

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog2]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    await cleanupNestJSApp();
  });

  test('should send audit log with fixed resource_id', async (t) => {
    const exporter = new OpenTelemetryHttpExporter(
      'test',
      'test',
      '127.0.0.1:4318'
    );
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(`${url}/fixed`);

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog2]);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    await cleanupNestJSApp();
  });

  test('should send audit log with resource_id is unknow', async (t) => {
    const exporter = new OpenTelemetryHttpExporter(
      'test',
      'test',
      '127.0.0.1:4318'
    );
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({
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
          id: 'unknown',
        },
      },
    ]);
    t.is(response.body, 'Congratulations! You created the cat unknown!');
    await cleanupNestJSApp();
  });

  test('should send audit log with actor from body', async (t) => {
    const exporter = new OpenTelemetryHttpExporter(
      'test',
      'test',
      '127.0.0.1:4318'
    );
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({
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
    await cleanupNestJSApp();
  });

  test('should send audit log with actor from guard', async (t) => {
    const exporter = new OpenTelemetryHttpExporter(
      'test',
      'test',
      '127.0.0.1:4318'
    );
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({
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
    await cleanupNestJSApp();
  });

  test('should send audit log with grpc exporter', async (t) => {
    const exporter = new OpenTelemetryGrpcExporter(
      'test',
      'test',
      '127.0.0.1:4317'
    );
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({ exporter: exporter }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got(`${url}?id=1`);

    t.true(httpServer.listening);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog1]);
    t.is(response.body, 'Congratulations! You have found the cat 1!');
    await cleanupNestJSApp();
  });

  test('should send audit log with real opentelemetry grpc exporter', async (t) => {
    const exporter = new OpenTelemetryGrpcExporter(
      'test',
      'test',
      '127.0.0.1:4317'
    );

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(url, { json: { id: '1' } });

    t.true(httpServer.listening);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    await cleanupNestJSApp();
  });

  test('should send audit log with real opentelemetry http exporter', async (t) => {
    const exporter = new OpenTelemetryHttpExporter(
      'test',
      'test',
      '127.0.0.1:4318'
    );

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({
        exporter,
      }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got.post(url, { json: { id: '1' } });

    t.true(httpServer.listening);
    t.is(response.body, 'Congratulations! You created the cat 1!');
    await cleanupNestJSApp();
  });

  test('should NOT send audit log without decorator', async (t) => {
    const exporter = new AuditLoggerDefaultExporter();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({ exporter: exporter }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = await got(`${url}/no-audit?id=1`);

    t.true(httpServer.listening);
    t.false(stub.called);
    t.is(response.body, 'Congratulations! You have found the cat 1!');
    await cleanupNestJSApp();
  });

  test('should send audit log with FAILED status', async (t) => {
    const exporter = new AuditLoggerDefaultExporter();
    const stub = sinon.stub(exporter, 'sendAuditLog');

    const testingServer = await createNestJSTestingServer({
      AuditLogModule: AuditLogModule.forRoot({ exporter: exporter }),
    });
    const { httpServer, url, cleanupNestJSApp } = testingServer;
    const response = got(`${url}/failed?id=1`);

    t.true(httpServer.listening);
    await t.throwsAsync(response);
    t.true(stub.called);
    t.deepEqual(removeIp(stub.firstCall.args), [auditLog3]);
    await cleanupNestJSApp();
  });
};
