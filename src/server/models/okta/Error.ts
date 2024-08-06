import { z } from 'zod';

/**
 * File related to Okta error codes and descriptions
 * Errors sourced from:
 * https://developer.okta.com/docs/reference/error-codes/
 */
const errorCauseSchema = z.object({
	errorSummary: z.string(),
});
export type ErrorCause = z.infer<typeof errorCauseSchema>;

// convert ErrorResponse to zod schema
export const errorResponseSchema = z.object({
	errorCode: z.string(),
	errorSummary: z.string(),
	errorLink: z.string(),
	errorId: z.string(),
	errorCauses: z.array(errorCauseSchema).nullable().optional(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

type ErrorName =
	| 'ApiValidationError'
	| 'AuthenticationFailedError'
	| 'ResourceNotFoundError'
	| 'ActivateUserFailedError'
	| 'UserOperationForbiddenError'
	| 'TooManyRequestsError'
	| 'PasswordPolicyViolationError'
	| 'OktaError';

const ErrorName = new Map<string, ErrorName>([
	['E0000001', 'ApiValidationError'],
	['E0000004', 'AuthenticationFailedError'],
	['E0000007', 'ResourceNotFoundError'],
	['E0000016', 'ActivateUserFailedError'],
	['E0000038', 'UserOperationForbiddenError'],
	['E0000047', 'TooManyRequestsError'],
	['E0000080', 'PasswordPolicyViolationError'],
]);

export class OktaError extends Error {
	name: ErrorName;
	causes: ErrorCause[];
	status: number;
	code?: string;
	constructor(error: {
		message?: string;
		status?: number;
		code?: string;
		causes?: ErrorCause[] | null;
	}) {
		super(error.message);
		this.name = (error.code && ErrorName.get(error.code)) || 'OktaError';
		this.causes = error.causes ?? [];
		this.status = error.status || 500;
		this.code = error.code;
	}
}

const oauthErrorSchema = z.object({
	error: z.string(),
	error_description: z.string(),
});
type OAuthErrorType = z.infer<typeof oauthErrorSchema>;

export class OAuthError extends Error {
	name: string;
	status: number;
	code: string;
	constructor(error: OAuthErrorType, status = 400) {
		super(error.error_description);
		this.name = error.error;
		this.code = error.error;
		this.status = status;
		this.message = error.error_description;
	}
}

export const isOAuthError = (error: unknown): error is OAuthErrorType => {
	return oauthErrorSchema.safeParse(error).success;
};
