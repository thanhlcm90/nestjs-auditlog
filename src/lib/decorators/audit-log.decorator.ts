import { applyDecorators, SetMetadata } from '@nestjs/common';

export const META_AUDIT_LOG = Symbol.for('__audit_log__');

export interface IAuditLogDecoratorOptions {
  /**
   * the resource.type for that api
   */
  resource_type: string;

  /**
   * the operator.type for that api
   */
  operator_type: string;

  /**
   * the operator.id for that api
   */
  operator_id: string;

  /**
   * the resource.id for that api. If null, get from resource_id_field_map
   */
  resource_id?: string;

  /**
   * field mapping from request to get resource.id
   * default: body.id
   */
  resource_id_field_map?: string;

  /**
   * field mapping from request to get actor.id
   * default: user.id
   */
  actor_id_field_map?: string;

  /**
   * field mapping from request to get actor.type
   * default: user.role
   */
  actor_type_field_map?: string;
}

export function AuditLog(
  options: IAuditLogDecoratorOptions
): (
  target: unknown,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<unknown>
) => void {
  return applyDecorators(SetMetadata(META_AUDIT_LOG, options));
}
