import { ClickHouseClient } from '@clickhouse/client';
import { ModuleMetadata } from '@nestjs/common';
import { LogRecordExporter } from '@opentelemetry/sdk-logs';

export interface IAuditLogResource {
  /**
   * Domain/application specific identifier of the resource. This field uniquely identifies the resource. The id must be unique within a type.
   *
   * REQUIREMENTS. Configurable defaults: The value must be at most 256 bytes in length.
   *
   * EXAMPLE. In an example social website domain, the value can represent post id, comment id, etc. For singleton resources the name can be used as a resource identifier, e.g. "site_settings" for global site settings that you want to audit.
   */
  id: string | string[];

  /**
   * Type of the resource. This field may be used to distinguish different kinds of resources from each other.
   *
   * REQUIREMENTS. Configurable defaults: The value must be at most 256 bytes in length.
   *
   * EXAMPLE. In an example social website domain, the following resource types can be used:
   *  - POST for content post;
   *  - COMMENT for comment to a post.
   *
   * BEST PRACTICE.
   *  - Match resource types according to your business domain model.
   *  - Keep the variety of resource types under control. This will make it easier to filter and analyze records.
   */
  type: string;
}

export interface IAuditLogOperation {
  /**
   * Domain/application specific identifier of the operation. This field identifies the operation that is audited.
   *
   * REQUIREMENTS. Configurable defaults: The value must be at most 512 bytes in length.
   *
   * EXAMPLE. A few examples on how the operation for creating a post comment can be identified:
   *  - Simple identifier like "CreateComment"
   *  - Event name, e.g. "CommentCreated"
   *  - API operation for HTTP, e.g. "POST /posts/101/comments"
   *  - API operation for gRPC, e.g. "example.v1.PostService/CreateComment"
   *  - Serverless function name
   *  - etc.
   */
  id: string | string[];

  /**
   * Type of the operation. This field may be used to categorize operations / actions / events.
   *
   * REQUIREMENTS. Configurable defaults: The value must be at most 256 bytes in length.
   *
   * EXAMPLE. In an example social website domain, the following operation types can be used:
   *  - CREATE when the post or comment is created;
   *  - UPDATE when the post or comment post is updated;
   *  - DELETE when the post or comment post is deleted.
   *
   * BEST PRACTICE.
   *  - Use type for high-level categorization and id for identification. For example, there can be multiple ways to create the resource: a user can create a resource from an app, an administrator can create a resource from the back office, a batch of resources can be created from the API - all of these operations can be of type CREATE.
   */
  type: string;

  /**
   * Enumerates available operation statuses.
   *
   *  - UNSPECIFIED: Operation status not provided or unknown.
   *  - SUCCEEDED: Operation succeeded.
   *  - FAILED: Operation failed.
   */
  status?: 'UNSPECIFIED' | 'SUCCEEDED' | 'FAILED';
}

export interface IAuditLogActor {
  /**
   * Domain/application specific identifier of the actor. This field uniquely identifies the actor who triggered the operation. The id must be unique within a type.
   *
   * REQUIREMENTS. Configurable defaults: The value must be at most 256 bytes in length.
   *
   * BEST PRACTICE.
   *  - The id may refer to a user (staff, customer, etc) or to a system (service account, etc), depending on the context of the operation.
   *  - This field is required. If, for any reason, there is a case when it is impossible or not desirable to provide actor identity, use a consistent stub value like "unknown".
   */
  id: string | string[];

  /**
   * Type of the actor. This field may be used to distinguish different kinds of actors from each other.
   *
   * REQUIREMENTS. Configurable defaults: The value must be at most 256 bytes in length.
   *
   * EXAMPLE. In an example social website domain, the following actor types can be used:
   *  - USER for a person that updates the post;
   *  - SERVICE_ACCOUNT for a system that automatically archives posts when they become outdated.
   */
  type: string;

  /**
   * The device's IP of actor that make request
   */
  ip?: string;

  /**
   * The device's user-agent of actor that make request
   */
  agent?: string;
}

export interface IAuditLogDataDiff {
  /**
   * data before making request
   */
  before?: any;

  /**
   * data after making request
   */
  after?: any;

  /**
   * json-diff
   */
  diff?: any;
}

export interface IAuditLog {
  /**
   * Represents the audit record resource.
   */
  resource: IAuditLogResource;

  /**
   * Represents the audit record operation.
   */
  operation: IAuditLogOperation;

  /**
   * Represents the audit record actor.
   */
  actor: IAuditLogActor;

  /**
   * Represents the audit record data_diff
   */
  data_diff?: IAuditLogDataDiff;
}

export interface IAuditLogConfigOptions {
  /**
   * setup audit log exporter
   */
  exporter: IAuditLogExporter;
}

export interface IAuditLogAsyncConfigOptions
  extends Partial<Pick<ModuleMetadata, 'imports' | 'providers'>> {
  useFactory: (
    ...args: any[]
  ) => IAuditLogConfigOptions | Promise<IAuditLogConfigOptions>;
  inject?: any[];
}

export interface IAuditLogExporter {
  startup(): Promise<void>;
  shutdown(): Promise<void>;
  sendAuditLog(log: IAuditLog): Promise<void>;
  customLoggerBodyTransformation(log: IAuditLog): string;
  clone(): IAuditLogExporter;
}

export interface IAuditLogExporterOptions {
  /**
   * service name that save to log, example: product
   */
  serviceName: string;

  /**
   * save namespace that save to log, example: audit-dev
   */
  serviceNamespace?: string;

  /**
   * log record exporter
   */
  exporter?: LogRecordExporter;

  /**
   * service environment name, example: development
   */
  serviceEnvironmentName?: string;
}

export interface IAuditLogClickHouseExporterOption
  extends IAuditLogExporterOptions {
  /**
   * ClickHouse DB url, default "http://localhost:8123"
   */
  clickHouseUrl?: string;

  /**
   * set this value will ignore the clickHouseUrl
   */
  clickHouseClient?: ClickHouseClient;

  /**
   * log database name, default "auditlog"
   */
  databaseName?: string;

  /**
   * log data expired in day, default is 180 days
   */
  logExpired?: number; // in second
}

export interface IExporterConfig {
  headers?: Partial<Record<string, unknown>>;
  hostname?: string;
  url?: string;
  concurrencyLimit?: number;
  /** Maximum time the OTLP exporter will wait for each batch export.
   * The default value is 10000ms. */
  timeoutMillis?: number;
}
