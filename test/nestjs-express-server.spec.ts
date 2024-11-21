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
const query = sinon.stub(clickHouseClient, 'query');
const insert = sinon.stub(clickHouseClient, 'insert');
createTests(
  createNestJSExpressServer,
  'ClickHouse Exporter',
  new AuditlogClickHouseExporter({
    clickHouseClient,
  }),
  (t) => {
    t.true(query.called);
    t.true(insert.called);
  }
);
