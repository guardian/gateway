import { getConfiguration } from '@/server/lib/getConfiguration';
import {
  buildApiUrlWithQueryParams,
  buildUrl,
  ExtractRouteParams,
} from '@/shared/lib/routeUtils';
import { OktaApiRoutePaths } from '@/shared/model/Routes';
import { joinUrl } from '@guardian/libs';
import { fetch } from '@/server/lib/fetch';
import type { Response } from 'node-fetch';
import { handleErrorResponse } from '@/server/lib/okta/api/errors';
import {
  authorizationHeader,
  defaultHeaders,
} from '@/server/lib/okta/api/headers';
import { OktaAPIResponseParsingError } from '@/server/models/okta/Error';
import { Profile, User } from '@/server/models/okta/User';

/**
 * Okta's Users API endpoints, see - https://developer.okta.com/docs/reference/api/users/
 */

const { okta } = getConfiguration();

export const createUser = async (email: string): Promise<User> => {
  const path = buildUrl('/api/v1/users');
  const body = {
    profile: {
      email: email,
      login: email,
      isGuardianUser: true,
    } as Profile,
  };
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
): Promise<User> => {
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

const handleUserResponse = async (response: Response): Promise<User> => {
  if (response.ok) {
    return await extractUser(response);
  } else {
    return await handleErrorResponse(response);
  }
};

const handleVoidResponse = async (response: Response): Promise<void> => {
  if (response.ok) {
    return Promise.resolve();
  } else {
    return await handleErrorResponse(response);
  }
};

const extractUser = async (response: Response): Promise<User> => {
  try {
    return await response.json().then((json) => {
      const user = json as User;
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
    throw new OktaAPIResponseParsingError(`${error}`);
  }
};
