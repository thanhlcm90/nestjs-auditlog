import { DEFAULT_OPERATION_TYPE_UPDATE } from '../constant';

import { AuditLog, IAuditLogDecoratorOptions } from './audit-log.decorator';

export function AuditLogUpdate(
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
      type: DEFAULT_OPERATION_TYPE_UPDATE,
      ...data?.operation,
    },
  });
}
