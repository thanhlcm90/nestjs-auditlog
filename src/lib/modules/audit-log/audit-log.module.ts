import { DynamicModule, Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AuditLogInterceptor } from './audit-log.interceptor';
import {
  IAuditLogAsyncConfigOptions,
  IAuditLogConfigOptions,
} from './audit-log.interface';
import { AuditLogService } from './audit-log.service';
import {
  AUDIT_LOG_CONFIG_OPTIONS,
  DEFAULT_AUDIT_LOG_CONFIG_OPTIONS,
} from './constant';

@Global()
@Module({})
export class AuditLogModule {
  static forRoot(options?: IAuditLogConfigOptions): DynamicModule {
    return {
      module: AuditLogModule,
      providers: [
        {
          provide: AUDIT_LOG_CONFIG_OPTIONS,
          useValue: options ?? DEFAULT_AUDIT_LOG_CONFIG_OPTIONS,
        },
        AuditLogService,
        {
          provide: APP_INTERCEPTOR,
          useClass: AuditLogInterceptor,
        },
      ],
      exports: [AuditLogService],
    };
  }

  static forRootAsync(options: IAuditLogAsyncConfigOptions): DynamicModule {
    const { useFactory, inject, imports, providers = [] } = options;

    return {
      module: AuditLogModule,
      imports,
      providers: [
        {
          provide: AUDIT_LOG_CONFIG_OPTIONS,
          useFactory,
          inject,
        },
        AuditLogService,
        {
          provide: APP_INTERCEPTOR,
          useClass: AuditLogInterceptor,
        },
        ...providers,
      ],
      exports: [AuditLogService],
    };
  }
}
