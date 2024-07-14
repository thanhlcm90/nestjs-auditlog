import { DEFAULT_OPERATION_TYPE_QUERY } from '../constant';

import { AuditLog, IAuditLogDecoratorOptions } from './audit-log.decorator';

export function AuditLogQuery(
  /**
   * audit data
   */
  data?: IAuditLogDecoratorOptions
): (
  target: unknown,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<unknown>
) => void {
  return AuditLog({
    ...data,
    operation: {
      type: DEFAULT_OPERATION_TYPE_QUERY,
      ...data?.operation,
    },
  });
}
