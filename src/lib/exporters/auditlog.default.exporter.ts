import { Logger } from '@nestjs/common';

import { IAuditLog, IAuditLogExporter } from '../audit-log.interface';

/**
 * The default exporter for Zero configuration, that print auditlog to `stdout` by using default NestJS `Logger`
 */
export class AuditLoggerDefaultExporter implements IAuditLogExporter {
  private _logger: Logger = new Logger(AuditLoggerDefaultExporter.name);

  constructor(logger?: Logger) {
    if (logger) {
      this._logger = logger;
    }
  }

  async sendAuditLog(log: IAuditLog) {
    this._logger.log(
      `The actor ${log.actor.type} ${log.actor.id} did the operator ${log.operation.type} ${log.operation.id} on the resource ${log.resource.type} ${log.resource.id}`,
      log
    );
  }
}
