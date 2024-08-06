import { joinUrl } from '@guardian/libs';
import { isBreachedPassword } from '@/server/lib/breachedPasswordCheck';
import { extractOktaRecoveryToken } from '@/server/lib/deeplink/oktaRecoveryToken';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { handleErrorResponse } from '@/server/lib/okta/api/errors';
import {
	authorizationHeader,
	defaultHeaders,
} from '@/server/lib/okta/api/headers';
import { ApiError } from '@/server/models/Error';
import type {
	AuthenticationRequestParameters,
	AuthenticationTransaction,
} from '@/server/models/okta/Authentication';
import { authenticationTransactionSchema } from '@/server/models/okta/Authentication';
import { OktaError } from '@/server/models/okta/Error';
import { buildUrl } from '@/shared/lib/routeUtils';
import { PasswordFieldErrors } from '@/shared/model/Errors';

const { okta } = getConfiguration();

/**
 * Okta's Authentication API
 * https://developer.okta.com/docs/reference/api/authn/
 */

/**
 * @name authenticate
 * @description Primary Authentication with Public Application
 *
 * The authentication endpoint takes a number of different parameters, which are documented here: https://developer.okta.com/docs/reference/api/authn/#request-parameters-for-primary-authentication
 *
 * Which parameters to provide depends on the context of use.
 *
 * For example for sign in with email/username and password, you would only provide:
 * @param {string} body.username User's short-name (for example: dade.murphy) or unique fully-qualified sign in name/email (for example: dade.murphy@example.com)
 * @param {string} body.password User's password credential
 *
 * Whereas in other cases, for example when activating a user with a token, you would provide:
 * @param {string} body.token Token received as part of activation user request. This token is emailed to the user when they register, and can be (re)generated by calling the activate or reactivate endpoints in the Users API
 * see [src/server/lib/okta/api/users.ts](users.ts)
 *
 * @returns Promise<AuthenticationTransaction>
 */
export const authenticate = async (
	body: AuthenticationRequestParameters,
): Promise<AuthenticationTransaction> => {
	const path = buildUrl('/api/v1/authn');
	return await fetch(joinUrl(okta.orgUrl, path), {
		method: 'POST',
		body: JSON.stringify(body),
		headers: defaultHeaders,
	}).then(handleAuthenticationResponse);
};

/**
 * @name validateRecoveryToken
 * @description Validates a recovery token that was distributed to the end user
 *
 * https://developer.okta.com/docs/reference/api/authn/#verify-recovery-token
 *
 * This is used to continue a recovery transaction (such as
 * resetting a password or completing account activation).
 *
 * If valid, a state token is returned which can be used to complete the recovery transaction.
 * This is a short-lived token with an expiry time of 5 minutes 30 seconds.
 *
 * @param {string} body.recoveryToken Recovery token that was distributed to the end user via out-of-band mechanism such as email
 *
 * @returns Promise<AuthenticationTransaction>
 */
export const validateRecoveryToken = async ({
	recoveryToken,
}: {
	recoveryToken: string;
}): Promise<AuthenticationTransaction> => {
	const path = buildUrl('/api/v1/authn/recovery/token');

	const body = {
		recoveryToken: extractOktaRecoveryToken(recoveryToken),
	};

	return await fetch(joinUrl(okta.orgUrl, path), {
		method: 'POST',
		body: JSON.stringify(body),
		headers: defaultHeaders,
	}).then(handleAuthenticationResponse);
};

/**
 * @name resetPassword
 * @description Completes a password reset transaction
 *
 * https://developer.okta.com/docs/reference/api/authn/#reset-password
 *
 * This is used to set a new password for a user. For security reasons, this method also performs the breached password check,
 * with the pwned password API. This is tightly coupled to this method so that in all cases where a password is reset, the password
 * is checked against the pwned password API.
 *
 * The documentation for the pwned password API is here:
 * https://haveibeenpwned.com/API/v3#PwnedPasswords
 *
 * @param {string} body.stateToken State token for the current transaction. State tokens can be obtained by starting a forgotten
 * password flow or admin-initiated reset password flow or by passing an activation token into the /authn endpoint
 * @param {string} body.newPassword User's new password
 *
 * @returns Promise<AuthenticationTransaction>
 */
export const resetPassword = async (body: {
	stateToken: string;
	newPassword: string;
}): Promise<AuthenticationTransaction> => {
	const path = buildUrl('/api/v1/authn/credentials/reset_password');

	if (await isBreachedPassword(body.newPassword)) {
		throw new ApiError({
			field: 'password',
			message: PasswordFieldErrors.COMMON_PASSWORD,
		});
	}

	return await fetch(joinUrl(okta.orgUrl, path), {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { ...defaultHeaders, ...authorizationHeader() },
	}).then(handleAuthenticationResponse);
};

/**
 * @name handleAuthenticationResponse
 * @description Handles the response from Okta's /authn endpoint
 * and converts it to a AuthenticationTransaction object
 * @param response fetch response object
 * @returns Promise<AuthenticationTransaction>
 */
const handleAuthenticationResponse = async (
	response: Response,
): Promise<AuthenticationTransaction> => {
	if (response.ok) {
		try {
			return authenticationTransactionSchema.parse(await response.json());
		} catch (error) {
			throw new OktaError({
				message: 'Could not parse Okta authentication transaction response',
			});
		}
	} else {
		return await handleErrorResponse(response);
	}
};
