<p align="center">
<a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>
<h1 align="center">NestJS AuditLog</h1>

<p align="center">
  SDK for NestJS framework to implement audit log feature via many exporter.
  <p align="center">
    <a href="https://www.npmjs.com/package/nestjs-auditlog" target="_blank"><img alt="npm version" src="https://img.shields.io/npm/v/nestjs-auditlog" /></a>
    <a href="https://www.npmjs.com/package/nestjs-auditlog" target="_blank"><img alt="NPM" src="https://img.shields.io/npm/l/nestjs-auditlog" /></a>
    <a href="https://www.npmjs.com/package/nestjs-auditlog" target="_blank"><img alt="npm downloads" src="https://img.shields.io/npm/dm/nestjs-auditlog" /></a>
     <a href="https://coveralls.io/github/thanhlcm90/nestjs-auditlog?branch=main" target="_blank"><img alt="coverage" src="https://coveralls.io/repos/github/thanhlcm90/nestjs-auditlog/badge.svg?branch=main" /></a>
  </p>
</p>

## Table of Contents

- [Description](#description)
- [API document](#api-document)
- [Installation](#installation)
- [Example](#example)
- [Configuration](#configuration)
- [Exporters](#exporters)
- [Data Changes Audit Log](#data-changes-audit-log)
- [Contact and Feedback](#contact-and-feedback)
- [License](#license)

## Description

Audit logging is the process of documenting activity within the software systems used across your organization. Audit logs record the occurrence of an event, the time at which it occurred, the responsible user or service, and the impacted entity. All of the devices in your network, your cloud services, and your applications emit logs that may be used for auditing purposes.

## API document

You can visit the full API documents <a href="https://thanhlcm90.github.io/nestjs-auditlog">in here</a>

## Installation

You can install the library using npm:

```
npm install nestjs-auditlog
```

## Example

To integrate `nestjs-auditlog` into your NestJS application, follow these steps:

1. First, import the module with `AuditLogModule.forRoot(...)` or `AuditLogModule.forRootAsync(...)` into your root `AppModule`. (refer to the module configuration documentation [below](#configuration)).

```ts
import { AuditLogModule } from 'nestjs-auditlog';

@Module({
  imports: [AuditLogModule.forRoot({
    exporter: new OpenTelemetryHttpExporter('service1', 'user', '127.0.0.1:4318')
  })],
  ...
})
class AppModule {}
```

Please note that that `AuditLogModule` is global module.

2. Next, put the decorator `@AuditLog` to every api you want to send audit log.

```typescript
import { Controller, Get, Query, Body, Post } from '@nestjs/common';
import { AuditLog } from 'nestjs-auditlog';

@Controller('/')
export class CatsController {
  @AuditLog({
    resource: {
      type: 'Cat',
    },
    operation: {
      id: 'findTheCat',
      type: 'Query',
    },
    resource_id_field_map: 'query.id',
  })
  @Get()
  findTheCat(@Query('id') id: string): any {
    return `Congratulations! You have found the cat ${id}!`;
  }

  @AuditLog({
    resource: {
      type: 'Cat',
    },
    operation: {
      type: 'Create',
      // if you ignore the id, we will get method name createTheCat as operation id
    },
    actor: {
      id: 'daniel',
      type: 'admin'
    }
    resource_id_field_map: 'body.id',
  })
  @Post()
  createTheCat(@Body() body: any): any {
    return `Congratulations! You created the cat ${body.id}!`;
  }
}
```

Please note that the above code snippets demonstrate the basic setup of `nestjs-auditlog` in your NestJS application. Make sure to adjust the code based on your specific application requirements and configuration.

We have many similar decorators for default defined operation type `Create`, `Update`, `Remove`, `Query`. You can check them on folder `decorators`:

- `AuditLogCreate`: decorator with default `operation.type = 'Create'`

- `AuditLogUpdate`: decorator with default `operation.type = 'Update'`

- `AuditLogRemove`: decorator with default `operation.type = 'Remove'`

- `AuditLogQuery`: decorator with default `operation.type = 'Query'`

- `AuditLogDataDiff`: param decorator support save the data changes to audit log

3. Another way, we can use the service `AuditLogService` to send audit log

```typescript
import { Controller, Get, Query, Body, Post } from '@nestjs/common';
import { AuditLog } from 'nestjs-auditlog';

@Controller('/')
export class CatsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findTheCat(@Query('id') id: string) {
    await this.auditLogService.sendAuditLog({
      resource: {
        id,
        type: 'Cat',
      },
      operation: {
        id: 'findTheCat',
        type: 'Query',
      },
      actor: {
        id: 'daniel',
        type: 'admin',
      },
    });
    return `Congratulations! You have found the cat ${id}!`;
  }
}
```

## Configuration

### Configuration interface

The following interface is used for `AuditLogModule` configuration:

```ts
export interface IAuditLogConfigOptions {
  /**
   * setup audit log exporter
   */
  exporter: IAuditLogExporter;
}
```

### Zero configuration

Just import `AuditLogModule` to `AppModule`:

```ts
import { AuditLogModule } from 'nestjs-auditlog';

@Module({
  imports: [AuditLogModule.forRoot()],
  ...
})
class AppModule {}
```

With Zero configuration, we will use default `AuditLoggerDefaultExporter` that print auditlog to `stdout` by using default `Logger`

### Asynchronous configuration

With `AuditLogModule.forRootAsync` you can, for example, import your `ConfigModule` and inject `ConfigService` to use it in `useFactory` method.

`useFactory` should return object with [Configuration interface](#configuration-interface)

Here's an example:

```ts
import { AuditLogModule } from 'nestjs-auditlog';

@Injectable()
class ConfigService {
  public readonly timeout = 10000;
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService]
})
class ConfigModule {}

@Module({
  imports: [
    AuditLogModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        await somePromise();
        return {
          exporter: new AuditLoggerDefaultExporter(),
        };
      }
    })
  ],
  ...
})
class AppModule {}
```

## Exporters

We have many Auditlog Exporter, please check the folder `exporters`. Some examples:

- `AuditLoggerDefaultExporter`: the default exporter for Zero configuration

- `OpenTelemetryGrpcExporter`: the exporter that will emit the audit log to Opentelemetry host by GRPC method

- `OpenTelemetryHttpExporter`: the exporter that will emit the audit log to Opentelemetry host by HTTP method

- `AuditlogClickHouseExporter`: the exporter that will emit the audit log to ClickHouse Database

### AuditlogClickHouseExporter

How to import the `AuditLogModule` using the exporter `AuditlogClickHouseExporter`

```ts
AuditLogModule.forRoot({
  exporter: new AuditlogClickHouseExporter({
    serviceName: 'test',
    databaseName: 'test_auditlog',
    clickHouseUrl: 'http://localhost:8123',
  }),
});
```

Or we can create the `ClickHouseClient` and pass it

```ts
AuditLogModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const client = createClient({
      url: config.clickhouseUrl,
      clickhouse_settings: {
        async_insert: 1,
      },
    });
    return {
      exporter: new AuditlogClickHouseExporter({
        serviceName: 'test',
        databaseName: 'test_auditlog',
        clickHouseClient: client,
      }),
    };
  },
});
```

The `AuditlogClickHouseExporter` will insert the full audit log into the table `audit_logs` with interface bellow:

```ts
export interface IAuditLogPayload {
  service_name: string;
  service_namespace: string;
  service_env: string;
  resource_id: string;
  resource_type: string;
  resource_data_before: any;
  resource_data_after: any;
  resource_data_diff: any;
  operation_id: string;
  operation_type: string;
  operation_status: string;
  actor_id: string;
  actor_type: string;
  actor_ip: string;
  actor_agent: string;
  message: string;
  created_at: string;
}
```

## Data Changes Audit Log

The library supports save the data changes to audit log report, please use the decorator `AuditLogDataDiff` when you want to save the data changes before and after an action.

Example code:

```ts
@AuditLog({
  resource: {
    type: 'Cat',
  },
  operation: {
    id: 'updateTheCat',
    type: 'Update',
  }
})
@Put(':id')
async updateTheCat(
  @Param('id') id: string,
  @Body() body: any,
  @AuditLogDataDiff() dataDiff: AuditLogDataDiffCallback
) {
  const catBefore = await this.catService.findCatById(id)

  await this.catService.updateCatById(id, body);

  const catAfter = await this.catService.findCatById(id)

  dataDiff(catBefore, catAfter);

  return catAfter;
}
```

## Contact and Feedback

If you have any ideas, comments, or questions, don't hesitate to contact me

Best regards,

Daniel Le

## License

This library is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
