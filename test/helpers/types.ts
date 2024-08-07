import { DynamicModule, INestApplication } from '@nestjs/common';

type TestingServerType = {
  readonly cleanupNestJSApp: () => Promise<void>;
  readonly port: number;
  readonly httpServer: any;
  readonly url: string;
  readonly app: INestApplication;
};

type NestJSTestingServerFactoryParams = {
  auditLogModule: DynamicModule;
  traceModule?: DynamicModule;
};

export type NestJSTestingServerFactory = (
  params: NestJSTestingServerFactoryParams
) => Promise<TestingServerType>;
