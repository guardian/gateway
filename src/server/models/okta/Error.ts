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

export type ErrorCode = 'E0000001' | 'E0000007' | 'E0000016' | 'E0000038';

export class OktaError extends Error {
  name: string;
  code?: ErrorCode;
  constructor(message?: string, name = 'OktaError', code?: ErrorCode) {
    super(message);
    this.name = name;
    this.code = code;
  }
}

export class ApiValidationError extends OktaError {
  constructor(
    message?: string,
    name = 'ApiValidationError',
    code: ErrorCode = 'E0000001',
  ) {
    super(message, name, code);
  }
}

export class ResourceAlreadyExistsError extends ApiValidationError {
  constructor(message?: string, name = 'ResourceAlreadyExistsError') {
    super(message, name);
  }
}

export class InvalidEmailFormatError extends ApiValidationError {
  constructor(message?: string, name = 'InvalidEmailFormatError') {
    super(message, name);
  }
}

export class MissingRequiredFieldError extends ApiValidationError {
  constructor(message?: string, name = 'MissingRequiredFieldError') {
    super(message, name);
  }
}

export class ResourceNotFoundError extends OktaError {
  constructor(
    message?: string,
    name = 'ResourceNotFoundError',
    code: ErrorCode = 'E0000007',
  ) {
    super(message, name, code);
  }
}

export class ActivateUserFailedError extends OktaError {
  constructor(
    message?: string,
    name = 'ActivateUserFailedError',
    code: ErrorCode = 'E0000016',
  ) {
    super(message, name, code);
  }
}

export class OperationForbiddenError extends OktaError {
  constructor(
    message?: string,
    name = 'OperationForbiddenError',
    code: ErrorCode = 'E0000038',
  ) {
    super(message, name, code);
  }
}

export class OktaAPIResponseParsingError extends OktaError {
  constructor(message?: string) {
    super(message);
  }
}
