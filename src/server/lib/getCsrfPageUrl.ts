import { Request } from 'express';

const protectedMethods = ['POST', 'PATCH', 'PUT', 'DELETE'];

export const getCsrfPageUrl = (request: Request): string => {
  // We redirect to pageUrl on CSRF error. It is the URL of the GET for the original form
  if (!protectedMethods.includes(request.method)) {
    return request.url;
  } else {
    return request.body?._csrfPageUrl ?? request.url;
  }
};
