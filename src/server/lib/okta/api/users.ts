import { getConfiguration } from '@/server/lib/getConfiguration';
import { buildApiUrlWithQueryParams, buildUrl } from '@/shared/lib/routeUtils';
import { joinUrl } from '@guardian/libs';
import { fetch } from '@/server/lib/fetch';
import {
  authorizationHeader,
  defaultHeaders,
} from '@/server/lib/okta/api/headers';
import {
  UserCreationRequest,
  UserResponse,
  UserUpdateRequest,
  ActivationTokenResponse,
  ResetPasswordUrlResponse,
  TokenResponse,
} from '@/server/models/okta/User';
import { handleVoidResponse } from '@/server/lib/okta/api/responses';
import { Response } from 'node-fetch';
import { OktaError } from '@/server/models/okta/Error';
import { handleErrorResponse } from '@/server/lib/okta/api/errors';

const { okta } = getConfiguration();

/**
 * Okta's Users API
 * https://developer.okta.com/docs/reference/api/users/
 */

/**
 * @name createUser
 * @description Creates a new user in Okta with or without credentials
 *
 * https://developer.okta.com/docs/reference/api/users/#create-user
 *
 * @param {UserCreationRequest} body the request body to create a user in Okta
 *
 * @returns Promise<UserResponse>
 */
export const createUser = async (
  body: UserCreationRequest,
): Promise<UserResponse> => {
  const path = buildUrl('/api/v1/users');
  return await fetch(joinUrl(okta.orgUrl, path), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleUserResponse);
};

/**
 * @name updateUser
 * @description Updates a user's profile or credentials with partial update semantics
 *
 * https://developer.okta.com/docs/reference/api/users/#update-profile-with-id
 *
 * @param id accepts the Okta user ID, email address (login) or login shortname (as long as it is unambiguous)
 * @param body the fields to update on the User object. This performs a partial update, so it is only necessary
 * to pass in the fields you wish to update.
 *
 * @returns Promise<UserResponse>
 */
export const updateUser = async (
  id: string,
  body: UserUpdateRequest,
): Promise<UserResponse> => {
  const path = buildUrl('/api/v1/users/:id', { id });
  return await fetch(joinUrl(okta.orgUrl, path), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleUserResponse);
};

/**
 * @name getUser
 * @description Get a user by ID/Email/Login
 *
 * https://developer.okta.com/docs/reference/api/users/#get-user
 *
 * @param id accepts the Okta user ID, email address (login) or login shortname (as long as it is unambiguous)
 *
 * @returns Promise<UserResponse>
 */

export const getUser = async (id: string): Promise<UserResponse> => {
  const path = buildUrl('/api/v1/users/:id', { id });
  return fetch(joinUrl(okta.orgUrl, path), {
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleUserResponse);
};

/**
 * @name activateUser
 * @description Activates a user
 *
 * https://developer.okta.com/docs/reference/api/users/#activate-user
 *
 * This operation can only be performed on users with a `STAGED` or `DEPROVISIONED` status.
 * Activation of a user is an asynchronous operation.
 *
 * - The user's `transitioningToStatus` property has a value of `ACTIVE` during activation to indicate that the user hasn't completed the asynchronous operation.
 * - The user's status is `ACTIVE` when the activation process is complete.
 *
 * Users who don't have a password must complete the welcome flow
 * by visiting the activation link to complete the transition to `ACTIVE` status.
 *
 * Returns empty object by default. If sendEmail is false, returns an activation
 * link for the user to set up their account. The activation token can be used
 * to create a custom activation link.
 *
 * @param id accepts the Okta user ID, email address (login) or login shortname (as long as it is unambiguous)
 * @param sendEmail Sends an activation email to the user if true
 *
 * @returns Promise<TokenResponse>
 */
export const activateUser = async (
  id: string,
  sendEmail = true,
): Promise<TokenResponse | void> => {
  const path = buildApiUrlWithQueryParams(
    '/api/v1/users/:id/lifecycle/activate',
    { id },
    { sendEmail },
  );
  return await fetch(joinUrl(okta.orgUrl, path), {
    method: 'POST',
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(async (response) => {
    return sendEmail
      ? await handleVoidResponse(response)
      : await handleActivationTokenResponse(response);
  });
};

/**
 * @name reactivateUser
 * @description Reactivates a user
 *
 * https://developer.okta.com/docs/reference/api/users/#reactivate-user
 *
 * This operation can only be performed on users with a `PROVISIONED` status.
 * This operation restarts the activation workflow if for some reason the
 * user activation was not completed when using the activationToken from Activate User.
 *
 * Users that don't have a password must complete the flow by completing
 * Reset Password steps to transition the user to `ACTIVE` status.
 
 * Returns empty object by default. If sendEmail is false, returns an activation
 * link for the user to set up their account. The activation token can be used
 * to create a custom activation link.
 *
 * @param id accepts the Okta user ID, email address (login) or login shortname (as long as it is unambiguous)
 * @param sendEmail Sends an activation email to the user if true
 *
 * @returns Promise<TokenResponse>
 */
export const reactivateUser = async (
  id: string,
  sendEmail = true,
): Promise<TokenResponse | void> => {
  const path = buildApiUrlWithQueryParams(
    '/api/v1/users/:id/lifecycle/reactivate',
    { id },
    { sendEmail },
  );
  return await fetch(joinUrl(okta.orgUrl, path), {
    method: 'POST',
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(async (response) => {
    return sendEmail
      ? await handleVoidResponse(response)
      : await handleActivationTokenResponse(response);
  });
};

/**
 * @name generateResetPasswordToken
 * @description Generates a reset password token for a user
 *
 * https://developer.okta.com/docs/reference/api/users/#reset-password
 *
 * Generates a one-time token (OTT) that can be used to reset a user's password.
 * The OTT link can be automatically emailed to the user or returned to the API
 * caller and distributed using a custom flow.
 *
 * This operation will transition the user to the status of RECOVERY and the
 * user will not be able to login or initiate a forgot password flow until they
 * complete the reset flow.
 *
 * Returns an empty object by default. If sendEmail is false, returns a link
 * for the user to reset their password.
 *
 * @param id accepts the Okta user ID, email address (login) or login shortname (as long as it is unambiguous)
 * @param sendEmail Sends an activation email to the user if true
 *
 * @returns Promise<TokenResponse>
 */
export const generateResetPasswordToken = async (
  id: string,
  sendEmail = false,
): Promise<TokenResponse | void> => {
  const path = buildApiUrlWithQueryParams(
    '/api/v1/users/:id/lifecycle/reset_password',
    { id },
    { sendEmail },
  );
  return await fetch(joinUrl(okta.orgUrl, path), {
    method: 'POST',
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(async (response) => {
    return sendEmail
      ? await handleVoidResponse(response)
      : await handleResetPasswordUrlResponse(response);
  });
};

/**
 * Clear User sessions
 *
 * Removes all active identity provider sessions. This forces the user to authenticate on the next operation.
 * Optionally revokes OpenID Connect and OAuth refresh and access tokens issued to the user.
 *
 * https://developer.okta.com/docs/reference/api/users/#clear-user-sessions
 *
 * @param id Okta user ID
 * @param oauthTokens (optional, default: `true`) Revoke issued OpenID Connect and OAuth refresh and access tokens
 * @returns Promise<void>
 */
export const clearUserSessions = async (
  id: string,
  oauthTokens = true,
): Promise<void> => {
  const path = buildApiUrlWithQueryParams(
    '/api/v1/users/:id/sessions',
    { id },
    {
      oauthTokens,
    },
  );
  return await fetch(joinUrl(okta.orgUrl, path), {
    method: 'DELETE',
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleVoidResponse);
};

/**
 * @name handleUserResponse
 * @description Handles the response from Okta's /users endpoint
 * and converts it to a UserResponse object
 * @param response node-fetch response object
 * @returns Promise<UserResponse>
 */

const handleUserResponse = async (
  response: Response,
): Promise<UserResponse> => {
  if (response.ok) {
    try {
      return await response.json().then((json) => {
        const user = json as UserResponse;
        return {
          id: user.id,
          status: user.status,
          profile: {
            email: user.profile.email,
            login: user.profile.login,
            isGuardianUser: user.profile.isGuardianUser,
          },
        };
      });
    } catch (error) {
      throw new OktaError({
        message: 'Could not parse Okta user response',
      });
    }
  } else {
    return await handleErrorResponse(response);
  }
};

/**
 * @name handleActivationTokenResponse
 * @description Handles the response from Okta's /lifecycle/activate and
 * /lifecycle/reactivate endpoints
 *
 * @param response node-fetch response object
 * @returns Promise<TokenResponse>
 */
const handleActivationTokenResponse = async (
  response: Response,
): Promise<TokenResponse> => {
  if (response.ok) {
    try {
      return await response.json().then((json) => {
        const response = json as ActivationTokenResponse;
        return {
          token: response.activationToken,
        };
      });
    } catch (error) {
      throw new OktaError({
        message: 'Could not parse Okta activation token response',
      });
    }
  } else {
    return await handleErrorResponse(response);
  }
};

/**
 * @name handleActivationTokenResponse
 * @description Handles the response from Okta's /lifecycle/reset_password
 * endpoint
 *
 * @param response node-fetch response object
 * @returns Promise<TokenResponse>
 */
const handleResetPasswordUrlResponse = async (
  response: Response,
): Promise<TokenResponse> => {
  if (response.ok) {
    try {
      return await response.json().then((json) => {
        const response = json as ResetPasswordUrlResponse;
        // Extract the token from the URL and return just it
        const token: string = response.resetPasswordUrl.split('/').slice(-1)[0];
        return { token };
      });
    } catch (error) {
      throw new OktaError({
        message: 'Could not parse Okta reset password token response',
      });
    }
  } else {
    return await handleErrorResponse(response);
  }
};
