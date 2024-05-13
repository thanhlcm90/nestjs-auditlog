import { DynamicModule, INestApplication } from '@nestjs/common';

type TestingServerType = {
  readonly getConnections: () => Promise<number>;
  readonly cleanupNestJSApp: () => Promise<void>;
  readonly port: number;
  readonly httpServer: any;
  readonly url: string;
  readonly app: INestApplication;
};

type NestJSTestingServerFactoryParams = {
  AuditLogModule: DynamicModule;
};

export type NestJSTestingServerFactory = (
  params: NestJSTestingServerFactoryParams
) => Promise<TestingServerType>;
