import { Module } from '@nestjs/common';

import { AuditLogModule } from '../../src';
import { AuditlogClickHouseExporter } from '../../src/lib/modules/audit-log/exporters/auditlog.clickhouse.exporter';

import { TestController } from './test.controller';

@Module({
  imports: [
    AuditLogModule.forRoot({
      exporter: new AuditlogClickHouseExporter({
        clickHouseUrl: 'http://10.11.4.182:8123',
      }),
    }),
  ],
  controllers: [TestController],
})
export class ExampleAppModule {}
