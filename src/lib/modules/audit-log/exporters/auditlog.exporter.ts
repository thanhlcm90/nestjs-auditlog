import { Logger, SeverityNumber } from '@opentelemetry/api-logs';
import { Resource } from '@opentelemetry/resources';
import {
  LoggerProvider,
  LogRecordExporter,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import {
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_NAMESPACE,
} from '@opentelemetry/semantic-conventions';

import { IAuditLog } from '../audit-log.interface';

/**
 * The abstract class of audit log exporter
 */
export class AuditLogExporter {
  private loggerProvider: LoggerProvider;
  private loggerOtel: Logger;

  constructor(
    serviceName: string,
    serviceNamespace: string,
    exporter?: LogRecordExporter,
    serviceEnvironmentName?: string
  ) {
    if (!exporter) return;

    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
      [SEMRESATTRS_SERVICE_NAMESPACE]: serviceNamespace,
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: serviceEnvironmentName,
    });

    this.loggerProvider = new LoggerProvider({
      resource,
    });

    this.loggerProvider.addLogRecordProcessor(
      new SimpleLogRecordProcessor(exporter)
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
