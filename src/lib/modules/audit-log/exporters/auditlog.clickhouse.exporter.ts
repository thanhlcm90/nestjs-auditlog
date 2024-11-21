import { ClickHouseClient, createClient } from '@clickhouse/client';

import {
  IAuditLog,
  IAuditLogClickHouseExporterOption,
  IAuditLogExporter,
} from '../audit-log.interface';

export class AuditlogClickHouseExporter implements IAuditLogExporter {
  private readonly client: ClickHouseClient;
  private readonly databaseName: string;
  private readonly logExpired: number;
  private readonly auditLogTableName: string;
  private readonly options: IAuditLogClickHouseExporterOption;

  constructor(options: IAuditLogClickHouseExporterOption = {}) {
    this.options = options;
    this.databaseName = options.databaseName ?? 'test_auditlog';
    this.client =
      options.clickHouseClient ??
      createClient({
        url: options.clickHouseUrl || 'http://localhost:8123',
        database: this.databaseName,
        clickhouse_settings: {
          async_insert: 1,
        },
      });
    this.auditLogTableName = 'audit_logs';
    this.logExpired = options.logExpired ?? 180;
  }

  clone(): IAuditLogExporter {
    return new AuditlogClickHouseExporter(this.options);
  }

  async startup() {
    try {
      // setup table
      await this.client.query({
        query: `
CREATE TABLE IF NOT EXISTS ${this.auditLogTableName} (
  resource_id String,
  resource_type String,
  resource_data_before String,
  resource_data_after String,
  operation_id String,
  operation_type String,
  operation_status String,
  actor_id String,
  actor_type String,
  actor_ip String,
  actor_agent String,
  message String,
  created_at DateTime
) ENGINE = MergeTree
PRIMARY KEY (created_at, actor_id, operation_type)
TTL created_at + toIntervalDay(${this.logExpired})
PARTITION BY toYYYYMM(created_at)
ORDER BY (created_at, actor_id, operation_type)
SETTINGS index_granularity = 8192
      `,
      });
    } catch (ex) {
      console.error(ex);
    }
  }

  async shutdown() {
    await this.client.close();
  }

  async sendAuditLog(log: IAuditLog) {
    const values = [
      {
        resource_id: log.resource.id ?? '',
        resource_type: log.resource.type ?? '',
        resource_data_before: '', // map later
        resource_data_after: '', // map later
        operation_id: log.operation.id ?? '',
        operation_type: log.operation.type ?? '',
        operation_status: log.operation.status ?? '',
        actor_id: log.actor.id ?? '',
        actor_type: log.actor.type ?? '',
        actor_ip: log.actor.ip ?? '',
        actor_agent: log.actor.agent ?? '',
        message: this.customLoggerBodyTransformation(log),
        created_at: Date.now(),
      },
    ];
    await this.client.insert({
      table: this.auditLogTableName,
      values: values,
      format: 'JSONEachRow',
    });
  }

  /**
   * the transformation function to convert audit log object to readable log body string
   *
   * @param log audit log
   * @returns log body
   */
  customLoggerBodyTransformation(log: IAuditLog): string {
    const resourceId = Array.isArray(log.resource.id)
      ? log.resource.id.join(',')
      : log.resource.id;

    return `The actor ${log.actor.type} ${log.actor.id} did the operator ${log.operation.type} ${log.operation.id} on the resource ${log.resource.type} ${resourceId}`;
  }
}
