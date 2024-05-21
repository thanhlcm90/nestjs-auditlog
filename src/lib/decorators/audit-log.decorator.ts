import { applyDecorators, SetMetadata } from '@nestjs/common';

import {
  IAuditLogActor,
  IAuditLogOperation,
  IAuditLogResource,
} from '../audit-log.interface';
import { META_AUDIT_LOG } from '../constant';

export interface IAuditLogDecoratorOptions {
  /**
   * the resource for that audit
   */
  resource?: Partial<IAuditLogResource>;

  /**
   * the operation for that audit
   */
  operation?: Partial<IAuditLogOperation>;

  /**
   * the actor for that audit
   */
  actor?: Partial<IAuditLogActor>;

  /**
   * field mapping from request to get resource.id. If you want to mapping from response, put the $response keyword at the beginning. Example: $response.data.id 
   * default: body.id
   */
  resource_id_field_map?: string;

  /**
   * field mapping from request to get actor.id. If you want to mapping from response, put the $response keyword at the beginning. Example: $response.data.id
   * default: user.id
   */
  actor_id_field_map?: string;

  /**
   * field mapping from request to get actor.type. If you want to mapping from response, put the $response keyword at the beginning. Example: $response.data.id
   * default: user.role
   */
  actor_type_field_map?: string;
}

export function AuditLog(
  /**
   * audit data
   */
  data?: IAuditLogDecoratorOptions
): (
  target: unknown,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<unknown>
) => void {
  return applyDecorators(SetMetadata(META_AUDIT_LOG, data ?? {}));
}
