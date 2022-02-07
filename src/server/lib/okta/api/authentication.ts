import { buildUrl } from '@/shared/lib/routeUtils';
import { fetch } from '@/server/lib/fetch';
import { joinUrl } from '@guardian/libs';
import {
  authorizationHeader,
  defaultHeaders,
} from '@/server/lib/okta/api/headers';
import { getConfiguration } from '@/server/lib/getConfiguration';
import {
  handleRecoveryTransactionResponse,
  handleVoidResponse,
} from '@/server/lib/okta/api/responses';
import { RecoveryTransaction } from '@/server/models/okta/RecoveryTransaction';

const { okta } = getConfiguration();

/**
 * Okta's Authentication API endpoints, see - https://developer.okta.com/docs/reference/api/authn/
 */

/**
 * Starts a new forgot password process by sending a reset password email
 * https://developer.okta.com/docs/reference/api/authn/#forgot-password-with-email-factor
 *
 * There are two ways to use this endpoint:
 * 1. without an API token - this starts a self-service forgotten password flow. The user
 * is still ACTIVE and can still sign-in without resetting their password
 * 2. with an API token - this becomes an administrator-initiated reset password flow which
 * puts the user into the RECOVERY state. This prevents them from signing in until they have
 * completed the recovery action and set a new password
 *
 * @param username User's short-name (for example: dade.murphy) or unique fully-qualified sign in
 * name (for example: dade.murphy@example.com)
 */
export const sendForgotPasswordEmail = async (
  username: string,
): Promise<void> => {
  const path = buildUrl('/api/v1/authn/recovery/password');
  const body = {
    username,
    factorType: 'EMAIL',
  };
  return await fetch(joinUrl(okta.orgUrl, path), {
    method: 'POST',
    body: JSON.stringify(body),
    // do not add authorization headers here as this turns the operation
    // into an administrator action and locks the user out of their account
    headers: defaultHeaders,
  }).then(handleVoidResponse);
};

/**
 * Validates a recovery token that was distributed to the end user to continue a recovery transaction (such as
 * resetting a password or completing account activation).
 *
 * If valid, a state token is returned which can be used to complete the recovery transaction.
 *
 * @param body.recoveryToken Recovery token that was distributed to the end user via out-of-band mechanism such as email
 */
export const validateRecoveryToken = async (body: {
  recoveryToken: string;
}): Promise<RecoveryTransaction> => {
  const path = buildUrl('/api/v1/authn/recovery/token');
  return await fetch(joinUrl(okta.orgUrl, path), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: defaultHeaders,
  }).then(handleRecoveryTransactionResponse);
};

/**
 * @param body.stateToken State token for the current transaction. State tokens can be obtained by starting a forgotten
 * password flow or admin-initiated reset password flow or by passing an activation token into the /authn endpoint
 * @param body.newPassword User's new password
 */
export const resetPassword = async (body: {
  stateToken: string;
  newPassword: string;
}): Promise<RecoveryTransaction> => {
  const path = buildUrl('/api/v1/authn/credentials/reset_password');
  return await fetch(joinUrl(okta.orgUrl, path), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleRecoveryTransactionResponse);
};
