import type { Response } from 'node-fetch';
import {
  ErrorResponse,
  OktaError,
  ErrorCode,
  ErrorCause,
} from '@/server/models/okta/Error';

export const extractErrorResponse = async (
  response: Response,
): Promise<ErrorResponse> => {
  try {
    return await response.json().then((json) => {
      const error = json as ErrorResponse;
      return {
        errorCode: error.errorCode,
        errorSummary: error.errorSummary,
        errorLink: error.errorLink,
        errorId: error.errorId,
        errorCauses: error.errorCauses,
      };
    });
  } catch (error) {
    throw new OktaError({
      message: 'Could not parse error response',
    });
  }
};

export const handleErrorResponse = async (response: Response) => {
  const error = await extractErrorResponse(response);
  throw new OktaError({
    message: error.errorSummary,
    status: response.status,
    code: error.errorCode as ErrorCode,
    causes: error.errorCauses,
  });
};

export const causesInclude = (
  causes: Array<ErrorCause>,
  substring: string,
): boolean => {
  return causes.some((cause) => cause.errorSummary.includes(substring));
};
