import type { Response } from 'node-fetch';
import {
  ErrorResponse,
  InvalidEmailFormatError,
  OktaAPIResponseParsingError,
  OktaError,
  ResourceAlreadyExistsError,
  ApiValidationError,
  ErrorCause,
  MissingRequiredFieldError,
  ResourceNotFoundError,
  ActivateUserFailedError,
  OperationForbiddenError,
  AuthenticationFailedError,
  TooManyRequestsError,
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
    throw new OktaAPIResponseParsingError(error);
  }
};

const errorCausesToString = (errorCauses: Array<ErrorCause>): string => {
  return errorCauses.map((cause) => cause.errorSummary).join(', ');
};

export const handleErrorResponse = async (response: Response) => {
  const error = await extractErrorResponse(response);
  if (error.errorId && error.errorSummary) {
    const { errorCode, errorSummary } = error;
    switch (errorCode) {
      case 'E0000001': {
        if (error.errorCauses) {
          const { errorCauses } = error;
          const errorCausesIncludes = (substring: string): boolean => {
            return errorCauses.some((cause) =>
              cause.errorSummary.includes(substring),
            );
          };
          if (errorCausesIncludes('already exists')) {
            throw new ResourceAlreadyExistsError(
              errorCausesToString(errorCauses),
            );
          } else if (
            errorCausesIncludes('email: Does not match required pattern')
          ) {
            throw new InvalidEmailFormatError(errorCausesToString(errorCauses));
          } else if (errorCausesIncludes('The field cannot be left blank')) {
            throw new MissingRequiredFieldError(
              errorCausesToString(errorCauses),
            );
          }
        }
        throw new ApiValidationError(errorSummary);
      }
      case 'E0000004': {
        throw new AuthenticationFailedError(error.errorSummary);
      }
      case 'E0000007': {
        throw new ResourceNotFoundError(error.errorSummary);
      }
      case 'E0000016': {
        throw new ActivateUserFailedError(error.errorSummary);
      }
      case 'E0000038': {
        throw new OperationForbiddenError(error.errorSummary);
      }
      case 'E0000047': {
        throw new TooManyRequestsError(error.errorSummary);
      }
      default:
        throw new OktaError(JSON.stringify(error));
    }
  }
  throw new OktaError(JSON.stringify(error));
};
