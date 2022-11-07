import { z } from 'zod';

/**
 * File related to Okta error codes and descriptions
 * Errors sourced from:
 * https://developer.okta.com/docs/reference/error-codes/
 */
const errorCauseSchema = z.object({
  errorSummary: z.string(),
});
export type ErrorCause = z.infer<typeof errorCauseSchema>;

// convert ErrorResponse to zod schema
export const errorResponseSchema = z.object({
  errorCode: z.string(),
  errorSummary: z.string(),
  errorLink: z.string(),
  errorId: z.string(),
  errorCauses: z.array(errorCauseSchema).nullable().optional(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

type ErrorName =
  | 'ApiValidationError'
  | 'AuthenticationFailedError'
  | 'ResourceNotFoundError'
  | 'ActivateUserFailedError'
  | 'UserOperationForbiddenError'
  | 'TooManyRequestsError'
  | 'PasswordPolicyViolationError'
  | 'OktaError';

const ErrorName = new Map<string, ErrorName>([
  ['E0000001', 'ApiValidationError'],
  ['E0000004', 'AuthenticationFailedError'],
  ['E0000007', 'ResourceNotFoundError'],
  ['E0000016', 'ActivateUserFailedError'],
  ['E0000038', 'UserOperationForbiddenError'],
  ['E0000047', 'TooManyRequestsError'],
  ['E0000080', 'PasswordPolicyViolationError'],
]);

export class OktaError extends Error {
  name: ErrorName;
  causes: Array<ErrorCause>;
  status: number;
  code?: string;
  constructor(error: {
    message?: string;
    status?: number;
    code?: string;
    causes?: Array<ErrorCause> | null;
  }) {
    super(error.message);
    this.name = (error.code && ErrorName.get(error.code)) || 'OktaError';
    this.causes = error.causes ?? [];
    this.status = error.status || 500;
    this.code = error.code;
  }
}
