/**
 * File related to Okta error codes and descriptions
 * Errors sourced from:
 * https://developer.okta.com/docs/reference/error-codes/
 */

export interface ErrorResponse {
  errorCode: string;
  errorSummary: string;
  errorLink: string;
  errorId: string;
  errorCauses: Array<ErrorCause>;
}

export interface ErrorCause {
  errorSummary: string;
}

export type ErrorName =
  | 'ApiValidationError'
  | 'AuthenticationFailedError'
  | 'ResourceNotFoundError'
  | 'ActivateUserFailedError'
  | 'UserOperationForbiddenError'
  | 'TooManyRequestsError'
  | 'PasswordPolicyViolationError'
  | 'OktaError';

export const ErrorName = new Map<string, ErrorName>([
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
    causes?: Array<ErrorCause>;
  }) {
    super(error.message);
    this.name =
      (error.code ? ErrorName.get(error.code) : 'OktaError') ?? 'OktaError';
    this.causes = error.causes ?? [];
    this.status = error.status || 500;
    this.code = error.code;
  }
}
