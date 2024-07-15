import { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import { Resource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_NAMESPACE,
} from '@opentelemetry/semantic-conventions';

const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const opentelemetry = require('@opentelemetry/sdk-node');

/**
 * The abstract class of Trace exporter
 */
export class TraceExporter {
  private sdk: any;

  constructor(
    private serviceName: string,
    private serviceNamespace: string,
    private exporter: OTLPExporterNodeConfigBase,
    private serviceEnvironmentName?: string
  ) {}

  async setup() {
    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: this.serviceName,
      [SEMRESATTRS_SERVICE_NAMESPACE]: this.serviceNamespace,
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: this.serviceEnvironmentName,
    });

    this.sdk = new opentelemetry.NodeSDK({
      traceExporter: this.exporter,
      instrumentations: [getNodeAutoInstrumentations()],
      resource,
    });

    // initialize the SDK and register with the OpenTelemetry API
    // this enables the API to record telemetry
    this.sdk.start();
  }

  async shutdown() {
    await this.sdk.shutdown();
  }
}
