import { Logger, SeverityNumber } from '@opentelemetry/api-logs';
import { Resource } from '@opentelemetry/resources';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import {
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_NAMESPACE,
} from '@opentelemetry/semantic-conventions';

import {
  IAuditLog,
  IAuditLogExporter,
  IAuditLogExporterOptions,
} from '../audit-log.interface';

/**
 * The abstract class of audit log exporter
 */
export class AuditLogExporter implements IAuditLogExporter {
  private readonly loggerProvider: LoggerProvider;
  private readonly loggerOtel: Logger;
  private readonly options: IAuditLogExporterOptions;

  constructor(options: IAuditLogExporterOptions) {
    this.options = options;

    if (!options.exporter) return;

    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: options.serviceName,
      [SEMRESATTRS_SERVICE_NAMESPACE]: options.serviceNamespace,
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: options.serviceEnvironmentName,
    });

    this.loggerProvider = new LoggerProvider({
      resource,
    });

    this.loggerProvider.addLogRecordProcessor(
      new SimpleLogRecordProcessor(options.exporter)
    );

    this.loggerOtel = this.loggerProvider.getLogger('default');
  }

  clone(): IAuditLogExporter {
    return new AuditLogExporter(this.options);
  }

  async startup() {}

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
