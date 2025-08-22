import { z } from 'zod';
import {
	CompleteLoginResponse,
	completeLoginResponseSchema,
	idxFetch,
} from '@/server/lib/okta/idx/shared/idxFetch';
import {
	baseRemediationValueSchema,
	idxBaseResponseSchema,
	IdxBaseResponse,
	AuthenticatorBody,
	selectAuthenticationEnrollSchema,
	IdxStateHandleBody,
	ExtractLiteralRemediationNames,
	challengeAuthenticatorSchema,
	validateRemediation,
	Authenticators,
} from '@/server/lib/okta/idx/shared/schemas';

// list of all possible remediations for the challenge response
export const challengeRemediations = z.union([
	challengeAuthenticatorSchema,
	selectAuthenticationEnrollSchema,
	baseRemediationValueSchema,
]);

// Schema for the challenge response
const challengeResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.string(),
			value: z.array(challengeRemediations),
		}),
		currentAuthenticatorEnrollment: z.object({
			type: z.literal('object'),
			value: z.union([
				z.object({
					type: z.literal('email'),
					resend: z.object({
						name: z.literal('resend'),
					}),
				}),
				z.object({
					type: z.literal('password'),
					recover: z.object({
						name: z.literal('recover'),
					}),
				}),
				z.object({
					type: z.literal('tac'),
				}),
			]),
		}),
	}),
);
export type ChallengeResponse = z.infer<typeof challengeResponseSchema>;

/**
 * @name challenge
 * @description Okta IDX API/Interaction Code flow - Authenticate with a given authenticator (currently `email` or `password`) for the user.
 * @param stateHandle - The state handle from the `identify`/`introspect` step
 * @param body - The authenticator object, containing the authenticator id and method type
 * @param ip - The ip address
 * @returns	Promise<ChallengeResponse> - The given authenticator challenge response
 */
export const challenge = (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: AuthenticatorBody['authenticator'],
	ip?: string,
): Promise<ChallengeResponse> => {
	return idxFetch<ChallengeResponse, AuthenticatorBody>({
		path: 'challenge',
		body: {
			stateHandle,
			authenticator: body,
		},
		schema: challengeResponseSchema,
		ip,
	});
};

// Type to extract all the remediation names from the challenge/answer response
type ChallengeResponseRemediationNames = ExtractLiteralRemediationNames<
	ChallengeResponse['remediation']['value'][number]
>;

/**
 * @name validateChallengeRemediation
 * @description Validates that the challenge response contains a remediation with the given name and authenticator.
 * @param challengeResponse - The challenge response
 * @param remediationName - The name of the remediation to validate
 * @param authenticator - The authenticator type - email or password
 * @param checkForResendOrRecover - Whether to check for resend (email) or recover (password) functionality depending on the authenticator
 * @param useThrow - Whether to throw an error if the remediation is not found (default: true)
 * @returns boolean - Whether the remediation was found in the response
 */
export const validateChallengeRemediation = (
	challengeResponse: ChallengeResponse,
	remediationName: ChallengeResponseRemediationNames,
	authenticator: Authenticators,
	checkForResendOrRecover = false,
	useThrow = true,
): boolean => {
	// Validate the remediation, will throw if useThrow is true and validation fails
	const validRemediation = validateRemediation<
		ChallengeResponse,
		ChallengeResponseRemediationNames
	>(challengeResponse, remediationName, useThrow);

	// if useThrow is false and the remediation is invalid, return false
	if (!validRemediation) {
		return false;
	}

	// check if the current authenticator enrollment matches the expected authenticator
	const validAuthenticator =
		challengeResponse.currentAuthenticatorEnrollment.value.type ===
		authenticator;

	// if the authenticator is invalid, throw an error or return false depending on useThrow
	if (!validAuthenticator) {
		if (useThrow) {
			throw new Error(
				`The challenge response does not contain the expected ${authenticator} authenticator`,
			);
		}

		return false;
	}

	// check for resend (email) or recover (password) if checkForResendOrRecover is true depending on the authenticator
	if (checkForResendOrRecover) {
		if (
			authenticator === 'email' &&
			challengeResponse.currentAuthenticatorEnrollment.value.type ===
				authenticator &&
			!challengeResponse.currentAuthenticatorEnrollment.value.resend
		) {
			if (useThrow) {
				throw new Error(
					'The challenge response does not contain the expected resend functionality for the email authenticator',
				);
			}

			return false;
		}

		if (
			authenticator === 'password' &&
			challengeResponse.currentAuthenticatorEnrollment.value.type ===
				authenticator &&
			!challengeResponse.currentAuthenticatorEnrollment.value.recover
		) {
			if (useThrow) {
				throw new Error(
					'The challenge response does not contain the expected recover functionality for the password authenticator',
				);
			}

			return false;
		}
	}

	// return true if everything is valid
	return true;
};

// Schema for the 'skip' object inside the challenge response remediation object
export const skipSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('skip'),
		href: z.string().url(),
	}),
);

// Schema for the 'reset-authenticator' object inside the challenge response remediation object
const resetAuthenticatorSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('reset-authenticator'),
		href: z.string().url(),
		value: z.array(
			z.union([
				z.object({
					name: z.literal('credentials'),
					type: z.literal('object'),
					form: z.object({
						value: z.array(
							z.object({
								name: z.string(),
							}),
						),
					}),
				}),
				z.object({
					name: z.literal('stateHandle'),
					value: z.string(),
				}),
			]),
		),
	}),
);

// list of all possible remediations for the challenge/answer response
export const challengeAnswerRemediations = z.union([
	selectAuthenticationEnrollSchema,
	skipSchema,
	resetAuthenticatorSchema,
	baseRemediationValueSchema,
]);

// Schema for the challenge/answer response
const challengeAnswerResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.string(),
			value: z.array(challengeAnswerRemediations),
		}),
	}),
);
export type ChallengeAnswerResponse = z.infer<
	typeof challengeAnswerResponseSchema
>;

// Body type for the challenge/answer request - passcode can refer to a OTP code or a password
type ChallengeAnswerBody = IdxStateHandleBody<{
	credentials: {
		passcode: string;
	};
}>;

/**
 * @name challengeAnswerPasscode
 * @description Okta IDX API/Interaction Code flow - Answer a challenge with a passcode (OTP code or password).
 *
 * @param stateHandle - The state handle from the previous step
 * @param body - The passcode object, containing the passcode
 * @param ip - The ip address
 * @returns Promise<ChallengeAnswerResponse> - The challenge answer response
 */
export const challengeAnswer = (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: ChallengeAnswerBody['credentials'],
	ip?: string,
): Promise<ChallengeAnswerResponse | CompleteLoginResponse> => {
	return idxFetch<
		ChallengeAnswerResponse | CompleteLoginResponse,
		ChallengeAnswerBody
	>({
		path: 'challenge/answer',
		body: {
			stateHandle,
			credentials: body,
		},
		schema: challengeAnswerResponseSchema.or(completeLoginResponseSchema),
		ip,
	});
};

/**
 * @name challengeResend
 * @description Okta IDX API/Interaction Code flow - Resend a challenge.
 *
 * @param stateHandle - The state handle from the previous step
 * @param ip - The ip address
 * @returns Promise<ChallengeAnswerResponse> - The challenge answer response
 */
export const challengeResend = (
	stateHandle: IdxBaseResponse['stateHandle'],
	ip?: string,
): Promise<ChallengeAnswerResponse> => {
	return idxFetch<ChallengeAnswerResponse, IdxStateHandleBody>({
		path: 'challenge/resend',
		body: {
			stateHandle,
		},
		schema: challengeAnswerResponseSchema,
		ip,
	});
};

// Type to extract all the remediation names from the challenge/answer response
type ChallengeAnswerRemediationNames = ExtractLiteralRemediationNames<
	ChallengeAnswerResponse['remediation']['value'][number]
>;

/**
 * @name validateChallengeAnswerRemediation
 * @description Validates that the challenge/answer response contains a remediation with the given name, throwing an error if it does not. This is useful for ensuring that the remediation we want to perform is available in the challenge/answer response, and the state is correct.
 * @param challengeAnswerResponse - The challenge/answer response
 * @param remediationName - The name of the remediation to validate
 * @param useThrow - Whether to throw an error if the remediation is not found (default: true)
 * @throws OAuthError - If the remediation is not found in the challenge/answer response
 * @returns boolean | void - Whether the remediation was found in the response
 */
export const validateChallengeAnswerRemediation = validateRemediation<
	ChallengeAnswerResponse,
	ChallengeAnswerRemediationNames
>;

/**
 * @name isChallengeAnswerCompleteLoginResponse
 * @description Type guard to check if the challenge answer response is a complete login response
 *
 * @param {ChallengeAnswerResponse | CompleteLoginResponse} response - The challenge answer response
 * @returns	{response is CompleteLoginResponse} - Whether the response is a complete login response
 */
export const isChallengeAnswerCompleteLoginResponse = (
	response: ChallengeAnswerResponse | CompleteLoginResponse,
): response is CompleteLoginResponse =>
	completeLoginResponseSchema.safeParse(response).success;
