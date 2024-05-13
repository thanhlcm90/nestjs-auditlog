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
  IAuditLogDecoratorOptions,
  META_AUDIT_LOG,
} from './decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly _reflector: Reflector
  ) {}

  private async sendAuditLog(options, request, status: 'SUCCEEDED' | 'FAILED') {
    const ip = getClientIp(request);
    const auditLog: IAuditLog = {
      resource: {
        id:
          options.resource_id ??
          _.get(request, options.resource_id_field_map ?? 'body.id') ??
          'unknown',
        type: options.resource_type,
      },
      operation: {
        id: options.operator_id,
        type: options.operator_type,
        status,
      },
      actor: {
        id:
          _.get(request, options.actor_id_field_map ?? 'user.id') ?? 'unknown',
        type:
          _.get(request, options.actor_type_field_map ?? 'user.role') ??
          'unknown',
        ip,
        agent: request.headers['user-agent'],
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
    const request: Request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap({
        next: async () => {
          if (options) {
            await this.sendAuditLog(options, request, 'SUCCEEDED');
          }
        },
        error: async () => {
          if (options) {
            await this.sendAuditLog(options, request, 'FAILED');
          }
        },
      })
    );
  }
}
