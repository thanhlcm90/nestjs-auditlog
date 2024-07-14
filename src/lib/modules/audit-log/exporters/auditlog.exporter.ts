import { IAuditLog } from '../audit-log.interface';

/**
 * The abstract class of audit log exporter
 */
export abstract class AuditLogExporter {
  abstract sendAuditLog(log: IAuditLog): Promise<any>;
  abstract shutdown(): Promise<void>;

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
