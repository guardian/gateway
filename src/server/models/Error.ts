import { GenericErrors } from '@/shared/model/Errors';

export class ApiError extends Error {
  status: number;
  statusText?: string; // used if the status number has a string representation
  field?: string; // used if the error is related to a particular form field

  constructor({
    message = GenericErrors.DEFAULT,
    name = 'ApiError',
    status = 500,
    statusText,
    field,
  }: {
    message?: string;
    name?: string;
    status?: number;
    statusText?: string;
    field?: string;
  } = {}) {
    super(message);
    this.name = name;
    this.status = status;
    this.statusText = statusText;
    this.field = field;
  }
}

export class IdapiError extends ApiError {
  constructor({
    message,
    status,
    field,
  }: {
    message?: string;
    status?: number;
    field?: string;
  }) {
    super({ message, status, field, name: 'IdapiError' });
  }
}

export class OktaApiError extends ApiError {
  constructor({
    message,
    status,
    statusText,
  }: {
    message?: string;
    status?: number;
    statusText?: string;
  }) {
    super({ message, status, statusText, name: 'OktaError' });
  }
}
