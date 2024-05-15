import { DEFAULT_OPERATION_TYPE_UPDATE } from '../constant';

import { AuditLog, IAuditLogDecoratorOptions } from './audit-log.decorator';

export function AuditLogUpdate(
  options?: IAuditLogDecoratorOptions
): (
  target: unknown,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<unknown>
) => void {
  return AuditLog({
    ...options,
    operation: {
      type: DEFAULT_OPERATION_TYPE_UPDATE,
      ...options?.operation,
    },
  });
}
