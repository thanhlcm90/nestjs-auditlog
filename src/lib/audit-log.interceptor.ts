import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as _ from 'lodash';
import { getClientIp } from 'request-ip';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { IAuditLog } from './audit-log.interface';
import { AuditLogService } from './audit-log.service';
import {
  DEFAULT_ACTOR_ID_FIELD_MAP,
  DEFAULT_ACTOR_TYPE_FIELD_MAP,
  DEFAULT_RESOURCE_ID_FIELD_MAP,
  DEFAULT_UNKNOWN_VALUE,
  OperationStatus,
  REQUEST_HEADER_USER_AGENT,
} from './constant';
import {
  IAuditLogDecoratorOptions,
  META_AUDIT_LOG,
} from './decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly _reflector: Reflector,
    private readonly auditLogService: AuditLogService
  ) {}

  private async sendAuditLog(
    options: IAuditLogDecoratorOptions,
    request,
    status: OperationStatus
  ) {
    const ip = getClientIp(request);
    const auditLog: IAuditLog = {
      resource: {
        id:
          options.resource?.id ??
          _.get(
            request,
            options.resource_id_field_map ?? DEFAULT_RESOURCE_ID_FIELD_MAP
          ) ??
          DEFAULT_UNKNOWN_VALUE,
        type: options.resource?.type ?? DEFAULT_UNKNOWN_VALUE,
      },
      operation: {
        id: options.operation.id ?? DEFAULT_UNKNOWN_VALUE,
        type: options.operation.type ?? DEFAULT_UNKNOWN_VALUE,
        status,
      },
      actor: {
        id:
          _.get(
            request,
            options.actor_id_field_map ?? DEFAULT_ACTOR_ID_FIELD_MAP
          ) ?? DEFAULT_UNKNOWN_VALUE,
        type:
          _.get(
            request,
            options.actor_type_field_map ?? DEFAULT_ACTOR_TYPE_FIELD_MAP
          ) ?? DEFAULT_UNKNOWN_VALUE,
        ip,
        agent: request.headers[REQUEST_HEADER_USER_AGENT],
      },
    };

    await this.auditLogService.sendAuditLog(auditLog);
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const options: IAuditLogDecoratorOptions | undefined =
      this._reflector.get<IAuditLogDecoratorOptions>(
        META_AUDIT_LOG,
        context.getHandler()
      );

    if (options) {
      options.operation = {
        id: context.getHandler().name,
        ...options.operation,
      };
    }

    const request: Request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap({
        next: async () => {
          if (options) {
            await this.sendAuditLog(
              options,
              request,
              OperationStatus.SUCCEEDED
            );
          }
        },
        error: async () => {
          if (options) {
            await this.sendAuditLog(options, request, OperationStatus.FAILED);
          }
        },
      })
    );
  }
} /* istanbul ignore next */
