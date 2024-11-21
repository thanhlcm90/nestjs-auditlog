import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { diff } from 'json-diff';

export type AuditLogDataDiffCallback = (before?: any, after?: any) => void;

export const AUDIT_LOG_DATA_DIFF_KEY = 'audit_log_data_diff';

/**
 * Params decorater to save audit log data difference
 */
export const AuditLogDataDiff = createParamDecorator(
  (_: any, ctx: ExecutionContext): AuditLogDataDiffCallback => {
    const request = ctx.switchToHttp().getRequest();

    return (before?: any, after?: any) => {
      request[AUDIT_LOG_DATA_DIFF_KEY] = {
        before,
        after,
        diff: diff(before, after),
      };
    };
  }
);
