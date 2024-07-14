import { ModuleMetadata } from '@nestjs/common';
import { AuditLogExporter } from './exporters/auditlog.exporter';

export interface IApmExporterConfig {
  headers?: Partial<Record<string, unknown>>;
  hostname?: string;
  url?: string;
  concurrencyLimit?: number;
  /** Maximum time the OTLP exporter will wait for each batch export.
   * The default value is 10000ms. */
  timeoutMillis?: number;
}

export interface IApmConfigOptions {
  /**
   * setup audit log exporter
   */
  exporter: AuditLogExporter;
}

export interface IAPMAsyncConfigOptions
  extends Partial<Pick<ModuleMetadata, 'imports' | 'providers'>> {
  useFactory: (
    ...args: any[]
  ) => IApmConfigOptions | Promise<IApmConfigOptions>;
  inject?: any[];
}
