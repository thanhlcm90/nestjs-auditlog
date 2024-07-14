export interface IExporterConfig {
  headers?: Partial<Record<string, unknown>>;
  hostname?: string;
  url?: string;
  concurrencyLimit?: number;
  /** Maximum time the OTLP exporter will wait for each batch export.
   * The default value is 10000ms. */
  timeoutMillis?: number;
}
