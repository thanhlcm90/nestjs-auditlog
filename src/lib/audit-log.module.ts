import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AuditLogInterceptor } from './audit-log.interceptor';
import {
  IAuditLogAsyncConfigOptions,
  IAuditLogConfigOptions,
} from './audit-log.interface';
import { AuditLogService } from './audit-log.service';
import { AUDIT_LOG_CONFIG_OPTIONS } from './constant';
import { AuditLoggerDefaultExporter } from './exporters';

@Module({})
export class AuditLogModule {
  static forRoot(options?: IAuditLogConfigOptions): DynamicModule {
    return {
      module: AuditLogModule,
      providers: [
        {
          provide: AUDIT_LOG_CONFIG_OPTIONS,
          useValue: options ?? { exporter: new AuditLoggerDefaultExporter() },
        },
        AuditLogService,
        {
          provide: APP_INTERCEPTOR,
          useClass: AuditLogInterceptor,
        },
      ],
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
    };
  }
}
