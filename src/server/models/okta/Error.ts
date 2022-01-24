export interface ErrorResponse {
  errorCode: ErrorCode;
  errorSummary: string;
  errorLink: string;
  errorId: string;
  errorCauses: Array<ErrorCause>;
}

export interface ErrorCause {
  errorSummary: string;
}

type ErrorCode =
  | 'E0000001'
  | 'E0000004'
  | 'E0000007'
  | 'E0000016'
  | 'E0000038'
  | 'E0000047';

export class OktaError extends Error {
  name: string;
  status: number;
  code?: ErrorCode;

  constructor(
    message?: string,
    name = 'OktaError',
    code?: ErrorCode,
    status?: number,
  ) {
    super(message);
    this.name = name;
    this.code = code;
    this.status = status || 500;
  }
}

export class ApiValidationError extends OktaError {
  constructor(
    message?: string,
    name = 'ApiValidationError',
    code: ErrorCode = 'E0000001',
    status = 400,
  ) {
    super(message, name, code, status);
  }
}

export class AuthenticationFailedError extends OktaError {
  constructor(
    message?: string,
    name = 'AuthenticationFailedError',
    code: ErrorCode = 'E0000004',
    status = 401,
  ) {
    super(message, name, code, status);
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
    status = 404,
  ) {
    super(message, name, code, status);
  }
}

export class ActivateUserFailedError extends OktaError {
  constructor(
    message?: string,
    name = 'ActivateUserFailedError',
    code: ErrorCode = 'E0000016',
    status = 403,
  ) {
    super(message, name, code, status);
  }
}

export class OperationForbiddenError extends OktaError {
  constructor(
    message?: string,
    name = 'OperationForbiddenError',
    code: ErrorCode = 'E0000038',
    status = 403,
  ) {
    super(message, name, code, status);
  }
}

export class TooManyRequestsError extends OktaError {
  constructor(
    message?: string,
    name = 'TooManyRequestsError',
    code: ErrorCode = 'E0000047',
    status = 429,
  ) {
    super(message, name, code, status);
  }
}

export class OktaAPIResponseParsingError extends OktaError {
  constructor(message?: string) {
    super(message);
  }
}
