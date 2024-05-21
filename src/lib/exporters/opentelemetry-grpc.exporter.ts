import { Logger, SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_NAMESPACE,
} from '@opentelemetry/semantic-conventions';

import { IAuditLog, IOtlpExporterConfig } from '../audit-log.interface';

import { AuditLogExporter } from './auditlog.exporter';

export class OpenTelemetryGrpcExporter extends AuditLogExporter {
  private loggerProvider: LoggerProvider;
  private loggerOtel: Logger;

  constructor(
    serviceName: string,
    serviceNamespace: string,
    config: IOtlpExporterConfig
  ) {
    super();
    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
      [SEMRESATTRS_SERVICE_NAMESPACE]: serviceNamespace,
    });

    this.loggerProvider = new LoggerProvider({
      resource,
    });

    this.loggerProvider.addLogRecordProcessor(
      new SimpleLogRecordProcessor(new OTLPLogExporter(config))
    );

    this.loggerOtel = this.loggerProvider.getLogger('default');
  }

  async shutdown() {
    await this.loggerProvider.shutdown();
  }

  async sendAuditLog(log: IAuditLog) {
    this.loggerOtel.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
      body: this.customLoggerBodyTransformation(log),
      attributes: log as any,
    });
  }
}
