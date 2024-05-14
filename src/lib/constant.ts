import { IAuditLogConfigOptions } from './audit-log.interface';
import { AuditLoggerDefaultExporter } from './exporters';

export const AUDIT_LOG_CONFIG_OPTIONS = 'AUDIT_LOG_CONFIG_OPTIONS';
export const DEFAULT_AUDIT_LOG_CONFIG_OPTIONS: IAuditLogConfigOptions = {
  exporter: new AuditLoggerDefaultExporter(),
};
