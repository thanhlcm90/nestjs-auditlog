import { Logger } from '@nestjs/common';

import { IAuditLog, IAuditLogExporter } from '../audit-log.interface';

import { AuditLogExporter } from './auditlog.exporter';

/**
 * The default exporter for Zero configuration, that print auditlog to `stdout` by using default NestJS `Logger`
 */
export class AuditLoggerDefaultExporter extends AuditLogExporter {
  private readonly _logger: Logger = new Logger(
    AuditLoggerDefaultExporter.name
  );

  constructor(logger?: Logger) {
    super({ serviceName: '', serviceNamespace: '', exporter: null });
    if (logger) {
      this._logger = logger;
    }
  }

  clone(): IAuditLogExporter {
    return new AuditLoggerDefaultExporter(this._logger);
  }

  async shutdown() {}

  override async sendAuditLog(log: IAuditLog) {
    this._logger.log(this.customLoggerBodyTransformation(log));
  }
}
