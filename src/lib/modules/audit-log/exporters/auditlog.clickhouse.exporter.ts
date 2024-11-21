import { ClickHouseClient, createClient } from '@clickhouse/client';

import {
  IAuditLog,
  IAuditLogClickHouseExporterOption,
  IAuditLogExporter,
} from '../audit-log.interface';

export class AuditlogClickHouseExporter implements IAuditLogExporter {
  private readonly databaseName: string;
  private readonly logExpired: number;
  private readonly auditLogTableName: string;
  private readonly options: IAuditLogClickHouseExporterOption;
  private client?: ClickHouseClient;

  constructor(options: IAuditLogClickHouseExporterOption) {
    this.options = options;
    this.databaseName = options.databaseName ?? 'auditlog';
    this.client = options.clickHouseClient;
    this.auditLogTableName = 'audit_logs';
    this.logExpired = options.logExpired ?? 180;
  }

  clone(): IAuditLogExporter {
    return new AuditlogClickHouseExporter(this.options);
  }

  createClickhouseClient(): ClickHouseClient {
    return createClient({
      url: this.options.clickHouseUrl || 'http://localhost:8123',
      database: this.databaseName,
      clickhouse_settings: {
        async_insert: 1,
      },
    });
  }

  getClient(): ClickHouseClient | undefined {
    return this.client;
  }

  async startup() {
    if (!this.client) {
      this.client = this.createClickhouseClient();
    }
    try {
      // setup table
      await this.getClient()?.query({
        query: `
CREATE TABLE IF NOT EXISTS ${this.auditLogTableName} (
  service_name String,
  service_namespace String,
  service_env String,
  resource_id String,
  resource_type String,
  resource_data_before String,
  resource_data_after String,
  resource_data_diff String,
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
PRIMARY KEY (service_name, service_namespace, service_env, created_at, actor_id, operation_type)
TTL created_at + toIntervalDay(${this.logExpired})
PARTITION BY toYYYYMM(created_at)
ORDER BY (service_name, service_namespace, service_env, created_at, actor_id, operation_type)
SETTINGS index_granularity = 8192
      `,
      });
    } catch (ex) {
      console.error(ex);
    }
  }

  async shutdown() {
    await this.getClient()?.close();
  }

  async sendAuditLog(log: IAuditLog) {
    try {
      const values = [
        {
          service_name: this.options.serviceName,
          service_namespace: this.options.serviceNamespace,
          service_env: this.options.serviceEnvironmentName,
          resource_id: log.resource.id,
          resource_type: log.resource.type,
          resource_data_before: JSON.stringify(log.data_diff?.before),
          resource_data_after: JSON.stringify(log.data_diff?.after),
          resource_data_diff: JSON.stringify(log.data_diff?.diff),
          operation_id: log.operation.id,
          operation_type: log.operation.type,
          operation_status: log.operation.status,
          actor_id: log.actor.id,
          actor_type: log.actor.type,
          actor_ip: log.actor.ip,
          actor_agent: log.actor.agent,
          message: this.customLoggerBodyTransformation(log),
          created_at: this.formatDateToUTC(new Date()),
        },
      ];
      await this.getClient()?.insert({
        table: this.auditLogTableName,
        values: values,
        format: 'JSONEachRow',
      });
    } catch (ex) {
      console.error(ex);
    }
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

  private padTo2Digits(num: number): string {
    return num.toString().padStart(2, '0');
  }

  private formatDateToUTC(date: Date): string {
    const year = date.getUTCFullYear();
    const month = this.padTo2Digits(date.getUTCMonth() + 1); // Months are zero-based
    const day = this.padTo2Digits(date.getUTCDate());
    const hours = this.padTo2Digits(date.getUTCHours());
    const minutes = this.padTo2Digits(date.getUTCMinutes());
    const seconds = this.padTo2Digits(date.getUTCSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
