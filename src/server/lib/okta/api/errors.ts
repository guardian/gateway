import {
	errorResponseSchema,
	ErrorResponse,
	OktaError,
	ErrorCause,
} from '@/server/models/okta/Error';

const extractErrorResponse = async (
	response: Response,
): Promise<ErrorResponse> => {
	try {
		return errorResponseSchema.parse(await response.json());
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
 * @param response fetch response object
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
	causes: ErrorCause[],
	substring: string,
): boolean => {
	return causes.some((cause) => cause.errorSummary.includes(substring));
};

/**
 * Typescript type predicate to check and narrow the type of error is an OktaError
 * @param error unknown error
 * @returns boolean
 */
export const isOktaError = (error: unknown): error is OktaError => {
	return error instanceof OktaError;
};
