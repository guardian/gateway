import { z } from 'zod';
import {
	IdxBaseResponse,
	IdxStateHandleBody,
	baseRemediationValueSchema,
	idxBaseResponseSchema,
	idxFetch,
	idxFetchCompletion,
} from './shared';
import { selectAuthenticationEnrollSchema } from './enroll';
import { ResponseWithRequestState } from '@/server/models/Express';
import { validateEmailAndPasswordSetSecurely } from '@/server/lib/okta/validateEmail';
import { logger } from '@/server/lib/serverSideLogger';
import { updateEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { Request } from 'express';
import { setupJobsUserInOkta } from '@/server/lib/jobs';
import { trackMetric } from '@/server/lib/trackMetric';
import { sendOphanComponentEventFromQueryParamsServer } from '@/server/lib/ophan';

// Schema for the 'skip' object inside the challenge response remediation object
export const skipSchema = baseRemediationValueSchema.merge(
	z.object({
		name: z.literal('skip'),
		href: z.string().url(),
	}),
);

// Schema for the challenge/answer response
const challengeAnswerResponseSchema = idxBaseResponseSchema.merge(
	z.object({
		remediation: z.object({
			type: z.string(),
			value: z.array(
				z.union([
					selectAuthenticationEnrollSchema,
					skipSchema,
					baseRemediationValueSchema,
				]),
			),
		}),
	}),
);
type ChallengeAnswerResponse = z.infer<typeof challengeAnswerResponseSchema>;

// Body type for the challenge/answer request - passcode can refer to a OTP code or a password
type ChallengeAnswerPasswordBody = IdxStateHandleBody<{
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
 * @returns Promise<ChallengeAnswerResponse> - The challenge answer response
 */
export const challengeAnswerPasscode = (
	stateHandle: IdxBaseResponse['stateHandle'],
	body: ChallengeAnswerPasswordBody['credentials'],
	request_id?: string,
): Promise<ChallengeAnswerResponse> => {
	return idxFetch<ChallengeAnswerResponse, ChallengeAnswerPasswordBody>({
		path: 'challenge/answer',
		body: {
			stateHandle,
			credentials: body,
		},
		schema: challengeAnswerResponseSchema,
		request_id,
	});
};

/**
 * @name challengeResend
 * @description Okta IDX API/Interaction Code flow - Resend a challenge.
 *
 * @param stateHandle - The state handle from the previous step
 * @param request_id - The request id
 * @returns Promise<ChallengeAnswerResponse> - The challenge answer response
 */
export const challengeResend = (
	stateHandle: IdxBaseResponse['stateHandle'],
	request_id?: string,
): Promise<ChallengeAnswerResponse> => {
	return idxFetch<ChallengeAnswerResponse, IdxStateHandleBody>({
		path: 'challenge/resend',
		body: {
			stateHandle,
		},
		schema: challengeAnswerResponseSchema,
		request_id,
	});
};

/**
 * @name setPasswordAndRedirect
 * @description Okta IDX API/Interaction Code flow - Answer a challenge with a password, and redirect the user to set a global session and then back to the app. This could be one the final possible steps in the authentication process.
 * @param stateHandle - The state handle from the previous step
 * @param body - The password object, containing the password
 * @param expressRes - The express response object
 * @param request_id - The request id
 * @returns Promise<void> - Performs a express redirect
 */
export const setPasswordAndRedirect = async ({
	stateHandle,
	body,
	expressReq,
	expressRes,
	path,
	request_id,
}: {
	stateHandle: IdxBaseResponse['stateHandle'];
	body: ChallengeAnswerPasswordBody['credentials'];
	expressReq: Request;
	expressRes: ResponseWithRequestState;
	path?: string;
	request_id?: string;
}): Promise<void> => {
	const [completionResponse, redirectUrl] =
		await idxFetchCompletion<ChallengeAnswerPasswordBody>({
			path: 'challenge/answer',
			body: {
				stateHandle,
				credentials: body,
			},
			expressRes,
			request_id,
		});

	// set the validation flags in Okta
	const { id } = completionResponse.user.value;
	if (id) {
		await validateEmailAndPasswordSetSecurely(id);
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
			await setupJobsUserInOkta(firstName, secondName, id);
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
