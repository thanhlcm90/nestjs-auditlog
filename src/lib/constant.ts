import { IAuditLogConfigOptions } from './audit-log.interface';
import { AuditLoggerDefaultExporter } from './exporters';

export const META_AUDIT_LOG = Symbol.for('__audit_log__');

export const AUDIT_LOG_CONFIG_OPTIONS = 'AUDIT_LOG_CONFIG_OPTIONS';
export const DEFAULT_AUDIT_LOG_CONFIG_OPTIONS: IAuditLogConfigOptions = {
  exporter: new AuditLoggerDefaultExporter(),
};

export const DEFAULT_UNKNOWN_VALUE = 'unknown';
export const DEFAULT_RESOURCE_ID_FIELD_MAP = 'body.id';
export const DEFAULT_ACTOR_ID_FIELD_MAP = 'user.id';
export const DEFAULT_ACTOR_TYPE_FIELD_MAP = 'user.role';
export const DEFAULT_OPERATION_TYPE_CREATE = 'Create';
export const DEFAULT_OPERATION_TYPE_UPDATE = 'Update';
export const DEFAULT_OPERATION_TYPE_REMOVE = 'Remove';
export const DEFAULT_OPERATION_TYPE_QUERY = 'Query';

export const REQUEST_HEADER_USER_AGENT = 'user-agent';

export enum OperationStatus {
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export const RESPONSE_KEYWORD = "$response.";