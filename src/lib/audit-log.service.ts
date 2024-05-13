import { Inject, Injectable } from '@nestjs/common';

import {
  IAuditLog,
  IAuditLogConfigOptions,
  IAuditLogExporter,
} from './audit-log.interface';
import { AUDIT_LOG_CONFIG_OPTIONS } from './constant';

@Injectable()
export class AuditLogService {
  private exporter: IAuditLogExporter;

  constructor(
    @Inject(AUDIT_LOG_CONFIG_OPTIONS)
    options: IAuditLogConfigOptions
  ) {
    this.exporter = options.exporter;
  }

  sendAuditLog(log: IAuditLog) {
    this.exporter.sendAuditLog(log);
  }
}
