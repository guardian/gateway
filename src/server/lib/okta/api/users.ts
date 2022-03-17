import { getConfiguration } from '@/server/lib/getConfiguration';
import {
  buildApiUrlWithQueryParams,
  buildUrl,
  ExtractRouteParams,
} from '@/shared/lib/routeUtils';
import { OktaApiRoutePaths } from '@/shared/model/Routes';
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
} from '@/server/models/okta/User';
import { handleVoidResponse } from '@/server/lib/okta/api/responses';
import { Response } from 'node-fetch';
import { OktaError } from '@/server/models/okta/Error';
import { handleErrorResponse } from '@/server/lib/okta/api/errors';

/**
 * Okta's Users API endpoints, see - https://developer.okta.com/docs/reference/api/users/
 */

const { okta } = getConfiguration();

/**
 * @param body the request body to create a user in Okta
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
 * @param id accepts the Okta user ID, email address (login) or login shortname (as long as it is unambiguous)
 * @param body the fields to update on the User object. This performs a partial update, so it is only necessary
 * to pass in the fields you wish to update.
 */
export const updateUser = async <P extends OktaApiRoutePaths>(
  id: ExtractRouteParams<P>,
  body: UserUpdateRequest,
): Promise<UserResponse> => {
  const path = buildUrl('/api/v1/users/:id', id);
  return await fetch(joinUrl(okta.orgUrl, path), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleUserResponse);
};

/**
 * @param id accepts the Okta user ID, email address (login) or login shortname (as long as it is unambiguous)
 */
export const fetchUser = async <P extends OktaApiRoutePaths>(
  id: ExtractRouteParams<P>,
): Promise<UserResponse> => {
  const path = buildUrl('/api/v1/users/:id', id);
  return fetch(joinUrl(okta.orgUrl, path), {
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleUserResponse);
};

/**
 * @param id accepts the Okta user ID, email address (login) or login shortname (as long as it is unambiguous)
 */
export const activateUser = async <P extends OktaApiRoutePaths>(
  id: ExtractRouteParams<P>,
): Promise<void> => {
  const path = buildApiUrlWithQueryParams(
    '/api/v1/users/:id/lifecycle/activate',
    id,
    { sendEmail: true },
  );
  return await fetch(joinUrl(okta.orgUrl, path), {
    method: 'POST',
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleVoidResponse);
};

/**
 * @param id accepts the Okta user ID, email address (login) or login shortname (as long as it is unambiguous)
 */
export const reactivateUser = async <P extends OktaApiRoutePaths>(
  id: ExtractRouteParams<P>,
): Promise<void> => {
  const path = buildApiUrlWithQueryParams(
    '/api/v1/users/:id/lifecycle/reactivate',
    id,
    { sendEmail: true },
  );
  return await fetch(joinUrl(okta.orgUrl, path), {
    method: 'POST',
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleVoidResponse);
};

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
