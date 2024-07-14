import { DEFAULT_OPERATION_TYPE_REMOVE } from '../constant';

import { AuditLog, IAuditLogDecoratorOptions } from './audit-log.decorator';

export function AuditLogRemove(
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
      type: DEFAULT_OPERATION_TYPE_REMOVE,
      ...data?.operation,
    },
  });
}
