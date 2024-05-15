import { NestFactory } from '@nestjs/core';

import { CatsModule } from '../app/test-module';

import { createAppModule } from './create-app-module';
import type { NestJSTestingServerFactory } from './types';

export const createNestJSExpressServer: NestJSTestingServerFactory = async (
  params
) => {
  const { AuditLogModule } = params;
  const AppModule = createAppModule({
    imports: [AuditLogModule, CatsModule],
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
