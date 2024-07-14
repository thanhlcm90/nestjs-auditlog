import { Logger } from '@nestjs/common';

import { IAuditLog } from '../audit-log.interface';

import { AuditLogExporter } from './auditlog.exporter';

/**
 * The default exporter for Zero configuration, that print auditlog to `stdout` by using default NestJS `Logger`
 */
export class AuditLoggerDefaultExporter extends AuditLogExporter {
  private _logger: Logger = new Logger(AuditLoggerDefaultExporter.name);

  constructor(logger?: Logger) {
    super();
    if (logger) {
      this._logger = logger;
    }
  }

  async shutdown() {}

  async sendAuditLog(log: IAuditLog) {
    this._logger.log(this.customLoggerBodyTransformation(log));
  }
}
