import {
  BeforeApplicationShutdown,
  Inject,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';

import {
  IAuditLog,
  IAuditLogConfigOptions,
  IAuditLogExporter,
} from './audit-log.interface';
import { AUDIT_LOG_CONFIG_OPTIONS } from './constant';

@Injectable()
export class AuditLogService
  implements BeforeApplicationShutdown, OnApplicationBootstrap
{
  private readonly exporter: IAuditLogExporter;

  constructor(
    @Inject(AUDIT_LOG_CONFIG_OPTIONS)
    options: Record<string, any> | IAuditLogConfigOptions
  ) {
    this.exporter = options.exporter;
  }

  async onApplicationBootstrap() {
    await this.exporter.startup();
  }

  async sendAuditLog(log: IAuditLog) {
    return this.exporter.sendAuditLog(log);
  }

  async beforeApplicationShutdown(): Promise<void> {
    await this.exporter.shutdown();
  }

  async getDataBefore() {
    return {
      name: 'cat 1',
    };
  }

  async getDataAfter() {
    return {
      name: 'cat 2',
    };
  }
}
