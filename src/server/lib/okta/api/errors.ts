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
} from '@/server/models/okta/Error';

export const handleErrorResponse = async (response: Response) => {
  const error = await extractErrorResponse(response);
  if (error.errorId && error.errorSummary) {
    const { errorCode, errorSummary } = error;
    switch (errorCode) {
      case 'E0000001': {
        if (error.errorCauses) {
          const { errorCauses } = error;
          if (
            errorCauses.some((cause) =>
              cause.errorSummary.includes('already exists'),
            )
          ) {
            throw new ResourceAlreadyExistsError(
              errorCausesToString(errorCauses),
            );
          } else if (
            errorCauses.some((cause) =>
              cause.errorSummary.includes(
                'email: Does not match required pattern',
              ),
            )
          ) {
            throw new InvalidEmailFormatError(errorCausesToString(errorCauses));
          } else if (
            errorCauses.some((cause) =>
              cause.errorSummary.includes('The field cannot be left blank'),
            )
          ) {
            throw new MissingRequiredFieldError(
              errorCausesToString(errorCauses),
            );
          }
        }
        throw new ApiValidationError(errorSummary);
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
      default:
        throw new OktaError(JSON.stringify(error));
    }
  }
  throw new OktaError(JSON.stringify(error));
};

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
    throw new OktaAPIResponseParsingError(`${error}`);
  }
};

const errorCausesToString = (errorCauses: Array<ErrorCause>): string => {
  return errorCauses.map((cause) => cause.errorSummary).join(', ');
};
