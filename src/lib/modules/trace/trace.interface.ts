import { ModuleMetadata } from '@nestjs/common';

import { TraceExporter } from './exporters/trace.exporter';

export interface ITraceConfigOptions {
  /**
   * setup audit log exporter
   */
  exporter: TraceExporter;
}

export interface ITraceAsyncConfigOptions
  extends Partial<Pick<ModuleMetadata, 'imports' | 'providers'>> {
  useFactory: (
    ...args: any[]
  ) => ITraceConfigOptions | Promise<ITraceConfigOptions>;
  inject?: any[];
}
