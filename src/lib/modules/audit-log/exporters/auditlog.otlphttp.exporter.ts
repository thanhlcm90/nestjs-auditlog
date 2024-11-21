import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';

import { IExporterConfig } from '../audit-log.interface';

import { AuditLogExporter } from './auditlog.exporter';

export class AuditlogOltpHttpExporter extends AuditLogExporter {
  constructor(
    serviceName: string,
    serviceNamespace: string,
    config: IExporterConfig,
    serviceEnvironmentName?: string
  ) {
    const exporter = new OTLPLogExporter(config);
    super({ serviceName, serviceNamespace, exporter, serviceEnvironmentName });
  }
}
