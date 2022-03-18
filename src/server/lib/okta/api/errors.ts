import type { Response } from 'node-fetch';
import {
  ErrorResponse,
  OktaError,
  ErrorCause,
} from '@/server/models/okta/Error';

const extractErrorResponse = async (
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
      message: 'Could not parse Okta error response',
    });
  }
};

/**
 * @name extractErrorResponse
 * @description Handles the response from an Okta error response
 * and converts it to a ErrorResponse object
 * @param response node-fetch response object
 * @returns Promise<ErrorResponse>
 */
export const handleErrorResponse = async (response: Response) => {
  const error = await extractErrorResponse(response);
  throw new OktaError({
    message: error.errorSummary,
    status: response.status,
    code: error.errorCode,
    causes: error.errorCauses,
  });
};

/**
 * @name causesInclude
 * @description Checks the error `causes` array for a specific error cause
 * @param {string[]} causes Array of error causes
 * @param {string} substring
 * @returns boolean
 */
export const causesInclude = (
  causes: Array<ErrorCause>,
  substring: string,
): boolean => {
  return causes.some((cause) => cause.errorSummary.includes(substring));
};
