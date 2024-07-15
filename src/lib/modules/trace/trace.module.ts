import {
  BeforeApplicationShutdown,
  DynamicModule,
  Global,
  Inject,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';

import { TRACE_CONFIG_OPTIONS } from './constant';
import { TraceExporter } from './exporters';
import {
  ITraceAsyncConfigOptions,
  ITraceConfigOptions,
} from './trace.interface';
@Global()
@Module({})
export class TraceModule implements BeforeApplicationShutdown, OnModuleInit {
  private exporter?: TraceExporter;
  private _logger: Logger = new Logger(TraceModule.name);

  constructor(
    @Inject(TRACE_CONFIG_OPTIONS)
    options?: Record<string, any> | ITraceConfigOptions
  ) {
    this.exporter = options.exporter;
  }

  async onModuleInit() {
    await this.exporter?.setup();
    this._logger.debug('The OLTP Trace is launched.');
  }

  static forRoot(options?: ITraceConfigOptions): DynamicModule {
    return {
      module: TraceModule,
      providers: [
        {
          provide: TRACE_CONFIG_OPTIONS,
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options: ITraceAsyncConfigOptions): DynamicModule {
    const { useFactory, inject, imports, providers = [] } = options;

    return {
      module: TraceModule,
      imports,
      providers: [
        {
          provide: TRACE_CONFIG_OPTIONS,
          useFactory,
          inject,
        },
        ...providers,
      ],
    };
  }

  async beforeApplicationShutdown() {
    await this.exporter?.shutdown();
  }
}
