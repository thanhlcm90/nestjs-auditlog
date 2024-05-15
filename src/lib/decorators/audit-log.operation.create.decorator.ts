import { DEFAULT_OPERATION_TYPE_CREATE } from '../constant';

import { AuditLog, IAuditLogDecoratorOptions } from './audit-log.decorator';

export function AuditLogCreate(
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
      type: DEFAULT_OPERATION_TYPE_CREATE,
      ...data?.operation,
    },
  });
}
