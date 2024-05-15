import { DEFAULT_OPERATION_TYPE_CREATE } from '../constant';

import { AuditLog, IAuditLogDecoratorOptions } from './audit-log.decorator';

export function AuditLogCreate(
  options?: IAuditLogDecoratorOptions
): (
  target: unknown,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<unknown>
) => void {
  return AuditLog({
    ...options,
    operation: {
      type: DEFAULT_OPERATION_TYPE_CREATE,
      ...options?.operation,
    },
  });
}
