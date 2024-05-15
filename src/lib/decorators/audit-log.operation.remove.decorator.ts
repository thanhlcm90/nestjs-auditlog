import { DEFAULT_OPERATION_TYPE_REMOVE } from '../constant';

import { AuditLog, IAuditLogDecoratorOptions } from './audit-log.decorator';

export function AuditLogRemove(
  options?: IAuditLogDecoratorOptions
): (
  target: unknown,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<unknown>
) => void {
  return AuditLog({
    ...options,
    operation: {
      type: DEFAULT_OPERATION_TYPE_REMOVE,
      ...options?.operation,
    },
  });
}
