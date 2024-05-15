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

import {
  IAuditLog,
  IAuditLogExporter,
  IOtlpExporterConfig,
} from '../audit-log.interface';

export class OpenTelemetryGrpcExporter implements IAuditLogExporter {
  private loggerProvider: LoggerProvider;
  private loggerOtel: Logger;

  constructor(
    serviceName: string,
    serviceNamespace: string,
    config: IOtlpExporterConfig
  ) {
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

  async sendAuditLog(log: IAuditLog) {
    this.loggerOtel.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
      body: `The actor ${log.actor.type} ${log.actor.id} did the operator ${log.operation.type} ${log.operation.id} on the resource ${log.resource.type} ${log.resource.id}`,
      attributes: log as any,
    });
  }
}
