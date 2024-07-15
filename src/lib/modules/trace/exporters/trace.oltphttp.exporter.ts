import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

import { IExporterConfig } from '../../../interfaces/exporter.config.interface';

import { TraceExporter } from './trace.exporter';

export class TraceOtlpHttpExporter extends TraceExporter {
  constructor(
    serviceName: string,
    serviceNamespace: string,
    config: IExporterConfig,
    serviceEnvironmentName?: string
  ) {
    const traceExporter = new OTLPTraceExporter(config);

    super(serviceName, serviceNamespace, traceExporter, serviceEnvironmentName);
  }
}
