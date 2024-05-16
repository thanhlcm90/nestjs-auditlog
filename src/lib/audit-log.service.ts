import { BeforeApplicationShutdown, Inject, Injectable } from '@nestjs/common';

import {
  IAuditLog,
  IAuditLogConfigOptions,
  IAuditLogExporter,
} from './audit-log.interface';
import { AUDIT_LOG_CONFIG_OPTIONS } from './constant';

@Injectable()
export class AuditLogService implements BeforeApplicationShutdown {
  private exporter: IAuditLogExporter;

  constructor(
    @Inject(AUDIT_LOG_CONFIG_OPTIONS)
    options: Record<string, any> | IAuditLogConfigOptions
  ) {
    this.exporter = options.exporter;
  }

  async sendAuditLog(log: IAuditLog) {
    return this.exporter.sendAuditLog(log);
  }

  async beforeApplicationShutdown(): Promise<void> {
    await this.exporter.shutdown();
  }
}
