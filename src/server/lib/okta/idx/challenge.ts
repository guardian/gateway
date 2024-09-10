import { z } from 'zod';
import { ResponseWithRequestState } from '@/server/models/Express';
import { validateEmailAndPasswordSetSecurely } from '@/server/lib/okta/validateEmail';
import { logger } from '@/server/lib/serverSideLogger';
import { updateEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { Request } from 'express';
import { setupJobsUserInOkta } from '@/server/lib/jobs';
import { trackMetric } from '@/server/lib/trackMetric';
import { sendOphanComponentEventFromQueryParamsServer } from '@/server/lib/ophan';
import {
	CompleteLoginResponse,
	completeLoginResponseSchema,
	idxFetch,
	idxFetchCompletion,
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
 * @param request_id - The request id
 * @param ip - The ip address
 * @returns	Promise<ChallengeResponse> - The given authenticator challenge response
 */
export const challenge = (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: AuthenticatorBody['authenticator'],
	request_id?: string,
	ip?: string,
): Promise<ChallengeResponse> => {
	return idxFetch<ChallengeResponse, AuthenticatorBody>({
		path: 'challenge',
		body: {
			stateHandle,
			authenticator: body,
		},
		schema: challengeResponseSchema,
		request_id,
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
 * @param request_id - The request id
 * @param ip - The ip address
 * @returns Promise<ChallengeAnswerResponse> - The challenge answer response
 */
export const challengeAnswer = (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: ChallengeAnswerBody['credentials'],
	request_id?: string,
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
		request_id,
		ip,
	});
};

/**
 * @name challengeResend
 * @description Okta IDX API/Interaction Code flow - Resend a challenge.
 *
 * @param stateHandle - The state handle from the previous step
 * @param request_id - The request id
 * @param ip - The ip address
 * @returns Promise<ChallengeAnswerResponse> - The challenge answer response
 */
export const challengeResend = (
	stateHandle: IdxBaseResponse['stateHandle'],
	request_id?: string,
	ip?: string,
): Promise<ChallengeAnswerResponse> => {
	return idxFetch<ChallengeAnswerResponse, IdxStateHandleBody>({
		path: 'challenge/resend',
		body: {
			stateHandle,
		},
		schema: challengeAnswerResponseSchema,
		request_id,
		ip,
	});
};

/**
 * @name setPasswordAndRedirect
 * @description Okta IDX API/Interaction Code flow - Answer a challenge with a password, and redirect the user to set a global session and then back to the app. This could be one the final possible steps in the authentication process.
 * @param stateHandle - The state handle from the previous step
 * @param body - The password object, containing the password
 * @param expressRes - The express response object
 * @param request_id - The request id
 * @param ip - The ip address
 * @returns Promise<void> - Performs a express redirect
 */
export const setPasswordAndRedirect = async ({
	stateHandle,
	body,
	expressReq,
	expressRes,
	path,
	request_id,
	ip,
}: {
	stateHandle: IdxBaseResponse['stateHandle'];
	body: ChallengeAnswerBody['credentials'];
	expressReq: Request;
	expressRes: ResponseWithRequestState;
	path?: string;
	request_id?: string;
	ip?: string;
}): Promise<void> => {
	const [completionResponse, redirectUrl] =
		await idxFetchCompletion<ChallengeAnswerBody>({
			path: 'challenge/answer',
			body: {
				stateHandle,
				credentials: body,
			},
			request_id,
			ip,
		});

	// set the validation flags in Okta
	const { id } = completionResponse.user.value;
	if (id) {
		await validateEmailAndPasswordSetSecurely(id, ip);
	} else {
		logger.error(
			'Failed to set validation flags in Okta as there was no id',
			undefined,
			{
				request_id,
			},
		);
	}

	// When a jobs user is registering, we add them to the GRS group and set their name
	if (
		expressRes.locals.queryParams.clientId === 'jobs' &&
		path === '/welcome'
	) {
		if (id) {
			const { firstName, secondName } = expressReq.body;
			await setupJobsUserInOkta(firstName, secondName, id, ip);
			trackMetric('JobsGRSGroupAgree::Success');
		} else {
			logger.error(
				'Failed to set jobs user name and field in Okta as there was no id',
				undefined,
				{
					request_id,
				},
			);
		}
	}

	updateEncryptedStateCookie(expressReq, expressRes, {
		// Update the passwordSetOnWelcomePage only when we are on the welcome page
		...(path === '/welcome' && { passwordSetOnWelcomePage: true }),
		// We want to remove all query params from the cookie after the password is set,
		queryParams: undefined,
	});

	// fire ophan component event if applicable
	if (expressRes.locals.queryParams.componentEventParams) {
		void sendOphanComponentEventFromQueryParamsServer(
			expressRes.locals.queryParams.componentEventParams,
			'SIGN_IN',
			'web',
			expressRes.locals.ophanConfig.consentUUID,
			expressRes.locals.requestId,
		);
	}

	// redirect the user to set a global session and then back to completing the authorization flow
	return expressRes.redirect(303, redirectUrl);
};

// Type to extract all the remediation names from the challenge/answer response
export type ChallengeAnswerRemediationNames = ExtractLiteralRemediationNames<
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
 * @name isChallengeAnswerResponse
 * @description Type guard to check if the response is a challenge answer response
 *
 * @param {ChallengeAnswerResponse | CompleteLoginResponse} response - The challenge answer response
 * @returns {response is ChallengeAnswerResponse} - Whether the response is a challenge answer response
 */
export const isChallengeAnswerResponse = (
	response: ChallengeAnswerResponse | CompleteLoginResponse,
): response is ChallengeAnswerResponse =>
	challengeAnswerResponseSchema.safeParse(response).success;

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
