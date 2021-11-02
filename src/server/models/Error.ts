import { GenericErrors } from '@/shared/model/Errors';

export class ApiError extends Error {
  status: number;
  field?: string; // used if the error is related to a particular form field

  constructor({
    message = GenericErrors.DEFAULT,
    name = 'ApiError',
    status = 500,
    field,
  }: {
    message?: string;
    name?: string;
    status?: number;
    field?: string;
  } = {}) {
    super();
    this.message = message;
    this.name = name;
    this.status = status;
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
