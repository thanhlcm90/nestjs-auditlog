import { createClient } from '@clickhouse/client';
import sinon from 'sinon';

import {
  AuditlogClickHouseExporter,
  AuditLoggerDefaultExporter,
  AuditlogOltpGrpcExporter,
  AuditlogOltpHttpExporter,
} from '../src';

import { createTests } from './all-tests';
import { createNestJSExpressServer } from './helpers/create-nestjs-express-server';

// test for default exporter
createTests(
  createNestJSExpressServer,
  'Default Exporter',
  new AuditLoggerDefaultExporter()
);

// test for OLTP HTTP exporter
createTests(
  createNestJSExpressServer,
  'OLTP HTTP Exporter',
  new AuditlogOltpHttpExporter('test', 'test', {
    url: '127.0.0.1:4318',
  })
);

// test for OLTP GRPC exporter
createTests(
  createNestJSExpressServer,
  'OLTP GRPC Exporter',
  new AuditlogOltpGrpcExporter('test', 'test', {
    url: '127.0.0.1:4317',
  })
);

// test for ClickHouse exporter
const clickHouseClient = createClient({
  url: 'http://localhost:8123',
  clickhouse_settings: {
    async_insert: 1,
  },
});
const query1 = sinon.stub(clickHouseClient, 'query');
const insert1 = sinon.stub(clickHouseClient, 'insert');
createTests(
  createNestJSExpressServer,
  'ClickHouse Exporter 1',
  new AuditlogClickHouseExporter({
    serviceName: 'test',
    clickHouseClient,
  }),
  (t) => {
    t.true(query1.called);
    t.true(insert1.called);
  }
);

const clickHouseExporter = new AuditlogClickHouseExporter({
  serviceName: 'test',
  serviceNamespace: 'test-dev',
  serviceEnvironmentName: 'dev',
  clickHouseUrl: 'http://localhost:8123',
  databaseName: 'test_auditlog',
  logExpired: 180,
});
const b = clickHouseExporter.clone();
sinon.stub(clickHouseExporter, 'clone').callsFake(() => {
  const a = b.clone();
  sinon.stub(a, 'createClickhouseClient');
  return a;
});
createTests(
  createNestJSExpressServer,
  'ClickHouse Exporter 2',
  clickHouseExporter
);
