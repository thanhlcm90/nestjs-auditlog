import { NestFactory } from '@nestjs/core';

import { TraceModule, TraceOtlpHttpExporter } from '../../src';
import { CatsModule } from '../app/test-module';

import { createAppModule } from './create-app-module';
import type { NestJSTestingServerFactory } from './types';

export const createNestJSExpressServer: NestJSTestingServerFactory = async (
  params
) => {
  let { auditLogModule, traceModule } = params;
  const traceExporter = new TraceOtlpHttpExporter('test', 'test', {
    url: '127.0.0.1:4318',
  });

  if (!traceModule) {
    traceModule = TraceModule.forRoot({
      exporter: traceExporter,
    });
  }
  const AppModule = createAppModule({
    imports: [auditLogModule, traceModule, CatsModule],
  });

  const app = await NestFactory.create(AppModule, { logger: false });
  const httpServer = app.getHttpServer();

  await app.listen(0);
  const port = httpServer.address().port;
  const url = `http://localhost:${port}`;

  return {
    port,
    httpServer,
    url,
    app,
    cleanupNestJSApp: async () => {
      await app.close();
    },
  };
};
