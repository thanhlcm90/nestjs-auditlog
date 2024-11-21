import { NestFactory } from '@nestjs/core';

import { ExampleAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(ExampleAppModule);
  await app.listen(process.env.PORT || 4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();