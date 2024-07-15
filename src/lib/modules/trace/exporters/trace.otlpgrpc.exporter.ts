import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

import { IExporterConfig } from '../../../interfaces/exporter.config.interface';

import { TraceExporter } from './trace.exporter';

export class TraceOtlpGrpcExporter extends TraceExporter {
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
