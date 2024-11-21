import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
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
  META_AUDIT_LOG,
  OperationStatus,
  REQUEST_HEADER_USER_AGENT,
  RESPONSE_KEYWORD,
} from './constant';
import { AUDIT_LOG_DATA_DIFF_KEY } from './decorators';
import { IAuditLogDecoratorOptions } from './decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly _reflector: Reflector,
    private readonly auditLogService: AuditLogService
  ) {}

  private deepValue(obj: Record<string, any>, path: string): any {
    return path
      .split('.')
      .reduce((acc, key) => (acc && key in acc ? acc[key] : undefined), obj);
  }

  private getFieldMap({ request, response }, fieldId: string) {
    return this.deepValue(
      fieldId.startsWith(RESPONSE_KEYWORD) ? response : request,
      fieldId.startsWith(RESPONSE_KEYWORD)
        ? fieldId.substring(RESPONSE_KEYWORD.length)
        : fieldId
    );
  }

  private async sendAuditLog(
    options: IAuditLogDecoratorOptions,
    request: Request,
    response: Response,
    status: OperationStatus
  ) {
    const ip = getClientIp(request);

    const auditLog: IAuditLog = {
      resource: {
        id:
          options.resource?.id ??
          this.getFieldMap(
            { request, response },
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
          this.getFieldMap(
            { request, response },
            options.actor_id_field_map ?? DEFAULT_ACTOR_ID_FIELD_MAP
          ) ?? DEFAULT_UNKNOWN_VALUE,
        type:
          this.getFieldMap(
            { request, response },
            options.actor_type_field_map ?? DEFAULT_ACTOR_TYPE_FIELD_MAP
          ) ?? DEFAULT_UNKNOWN_VALUE,
        ip,
        agent: request.headers[REQUEST_HEADER_USER_AGENT],
      },
    };

    if (request[AUDIT_LOG_DATA_DIFF_KEY]) {
      auditLog.data_diff = request[AUDIT_LOG_DATA_DIFF_KEY];
    }

    await this.auditLogService.sendAuditLog(auditLog);
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> {
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
        next: async (response) => {
          if (options) {
            await this.sendAuditLog(
              options,
              request,
              response,
              OperationStatus.SUCCEEDED
            );
          }
        },
        error: async (err) => {
          if (options) {
            await this.sendAuditLog(
              options,
              request,
              err.response,
              OperationStatus.FAILED
            );
          }
        },
      })
    );
  }
} /* istanbul ignore next */
