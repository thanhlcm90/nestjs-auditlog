import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';

import { IExporterConfig } from '../../../interfaces/exporter.config.interface';

import { AuditLogExporter } from './auditlog.exporter';

export class AuditlogOltpGrpcExporter extends AuditLogExporter {
  constructor(
    serviceName: string,
    serviceNamespace: string,
    config: IExporterConfig,
    serviceEnvironmentName?: string
  ) {
    const exporter = new OTLPLogExporter(config);
    super(serviceName, serviceNamespace, exporter, serviceEnvironmentName);
  }
}
