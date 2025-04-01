import { OAuthError } from '@/server/models/okta/Error';
import { Request } from 'express';
import {
	introspect,
	IntrospectRemediationNames,
	validateIntrospectRemediation,
} from '@/server/lib/okta/idx/introspect';
import {
	challengeAnswer,
	ChallengeAnswerResponse,
	isChallengeAnswerCompleteLoginResponse,
} from '@/server/lib/okta/idx/challenge';
import {
	CompleteLoginResponse,
	getLoginRedirectUrl,
} from '@/server/lib/okta/idx/shared/idxFetch';
import { validatePasswordFieldForOkta } from '@/server/lib/validatePasswordField';
import { isBreachedPassword } from '@/server/lib/breachedPasswordCheck';
import { PasswordFieldErrors } from '@/shared/model/Errors';
import { logger } from '@/server/lib/serverSideLogger';
import { updateEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { setupJobsUserInOkta } from '@/server/lib/jobs';
import { sendOphanComponentEventFromQueryParamsServer } from '@/server/lib/ophan';
import { trackMetric } from '@/server/lib/trackMetric';
import { ResponseWithRequestState } from '@/server/models/Express';
import { validateEmailAndPasswordSetSecurely } from '@/server/lib/okta/validateEmail';
import { IdxBaseResponse } from '@/server/lib/okta/idx/shared/schemas';

type Params = {
	stateHandle: string;
	introspectRemediation: IntrospectRemediationNames;
	ip?: string;
};

/**
 * @name submitPasscode
 * @description Submit a passcode to Okta to answer the passcode challenge using the `challenge/answer` endpoint and return the response
 *
 * @param passcode The passcode to submit
 * @param stateHandle The state handle from the `identify`/`introspect` step
 * @param introspectRemediation The remediation object name to validate the introspect response against
 * @param ip The IP address of the user
 * @returns Promise<ChallengeAnswerResponse | CompleteLoginResponse> - The challenge answer response
 */
export const submitPasscode = async ({
	passcode,
	stateHandle,
	introspectRemediation,
	ip,
}: Params & { passcode: string }): Promise<
	ChallengeAnswerResponse | CompleteLoginResponse
> => {
	// validate the code contains only numbers and is 6 characters long
	// The okta api will validate the input fully, but validating here will prevent unnecessary requests
	if (!/^\d{6}$/.test(passcode)) {
		throw new OAuthError(
			{
				error: 'api.authn.error.PASSCODE_INVALID',
				error_description: 'Passcode invalid', // this is ignored, and a error based on the `error` key is shown
			},
			400,
		);
	}

	// check the state handle is valid and we can proceed with the request
	const introspectResponse = await introspect(
		{
			stateHandle,
		},
		ip,
	);

	// check if the remediation array contains the correct remediation object supplied
	// if it does, then we know the stateHandle is valid and we're in the correct state for
	// the current flow
	validateIntrospectRemediation(introspectResponse, introspectRemediation);

	// attempt to answer the passcode challenge, if this fails, it falls through to the catch block where we handle the error
	return challengeAnswer(stateHandle, { passcode }, ip);
};

/**
 * @name submitPassword
 * @description Submit a password to Okta to answer the password challenge using the `challenge/answer` endpoint and return the response. Validation should be enabled as needed through the params, validatePasswordLength and validateBreachedPassword (both default to false).
 *
 * @param password The password to submit
 * @param stateHandle The state handle from the `identify`/`introspect` step
 * @param introspectRemediation The remediation object name to validate the introspect response against
 * @param ip The IP address of the user
 * @returns {Promise<ChallengeAnswerResponse | CompleteLoginResponse>} challengeAnswerResponse - The challenge answer response
 */
export const submitPassword = async ({
	password,
	stateHandle,
	introspectRemediation,
	validateBreachedPassword = false,
	validatePasswordLength = false,
	ip,
}: Params & {
	password: string;
	validatePasswordLength?: boolean;
	validateBreachedPassword?: boolean;
}): Promise<ChallengeAnswerResponse | CompleteLoginResponse> => {
	const introspectResponse = await introspect(
		{
			stateHandle,
		},
		ip,
	);

	validateIntrospectRemediation(introspectResponse, introspectRemediation);

	if (validatePasswordLength) {
		validatePasswordFieldForOkta(password);
	}

	if (validateBreachedPassword && (await isBreachedPassword(password))) {
		throw new OAuthError({
			error: 'password.common',
			error_description: PasswordFieldErrors.COMMON_PASSWORD,
		});
	}

	return challengeAnswer(stateHandle, { passcode: password }, ip);
};

/**
 * @name setPasswordAndRedirect
 * @description Okta IDX API/Interaction Code flow - Answer a challenge with a password, and redirect the user to set a global session and then back to the app. This could be one the final possible steps in the authentication process.
 * @param stateHandle - The state handle from the previous step
 * @param password - The password to set
 * @param expressReq - The express request object
 * @param expressRes - The express response object
 * @param introspectRemediation - The remediation object name to validate the introspect response against
 * @param path - The path of the page
 * @param ip - The ip address
 * @returns Promise<void> - Performs a express redirect
 */
export const setPasswordAndRedirect = async ({
	stateHandle,
	password,
	expressReq,
	expressRes,
	introspectRemediation,
	path,
	ip,
}: {
	stateHandle: IdxBaseResponse['stateHandle'];
	password: string;
	expressReq: Request;
	expressRes: ResponseWithRequestState;
	introspectRemediation: IntrospectRemediationNames;
	path?: string;
	ip?: string;
}): Promise<void> => {
	const challengeAnswerResponse = await submitPassword({
		stateHandle,
		password,
		introspectRemediation,
		ip,
		validateBreachedPassword: true,
		validatePasswordLength: true,
	});

	if (!isChallengeAnswerCompleteLoginResponse(challengeAnswerResponse)) {
		throw new OAuthError({
			error: 'idx.invalid.response',
			error_description: 'The response was not a complete login response',
		});
	}

	const loginRedirectUrl = getLoginRedirectUrl(challengeAnswerResponse);

	// set the validation flags in Okta
	const { id } = challengeAnswerResponse.user.value;
	if (id) {
		await validateEmailAndPasswordSetSecurely({
			id,
			ip,
		});
	} else {
		logger.error(
			'Failed to set validation flags in Okta as there was no id',
			undefined,
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
		);
	}

	// redirect the user to set a global session and then back to completing the authorization flow
	return expressRes.redirect(303, loginRedirectUrl);
};
