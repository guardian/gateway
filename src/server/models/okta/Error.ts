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

export type ErrorCode =
  | 'E0000001'
  | 'E0000007'
  | 'E0000016'
  | 'E0000038'
  | 'E0000080';

export type ErrorName =
  | 'ApiValidationError'
  | 'ResourceNotFoundError'
  | 'ActivateUserFailedError'
  | 'UserOperationForbiddenError'
  | 'PasswordPolicyViolationError'
  | 'OktaError';

export const ErrorName = new Map<ErrorCode, ErrorName>([
  ['E0000001', 'ApiValidationError'],
  ['E0000007', 'ResourceNotFoundError'],
  ['E0000016', 'ActivateUserFailedError'],
  ['E0000038', 'UserOperationForbiddenError'],
  ['E0000080', 'PasswordPolicyViolationError'],
]);

export class OktaError extends Error {
  name: ErrorName;
  causes: Array<ErrorCause>;
  status?: number;
  code?: ErrorCode;
  constructor(error: {
    message?: string;
    status?: number;
    code?: ErrorCode;
    causes?: Array<ErrorCause>;
  }) {
    super(error.message);
    this.name =
      (error.code ? ErrorName.get(error.code) : 'OktaError') ?? 'OktaError';
    this.causes = error.causes ?? [];
    this.status = error.status;
    this.code = error.code;
  }
}
