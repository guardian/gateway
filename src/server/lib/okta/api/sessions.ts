import { OktaError } from '@/server/models/okta/Error';
import { SessionResponse, sessionSchema } from '@/server/models/okta/Session';
import { buildUrl } from '@/shared/lib/routeUtils';
import { joinUrl } from '@guardian/libs';
import { getConfiguration } from '../../getConfiguration';
import { handleErrorResponse } from './errors';
import { defaultHeaders, authorizationHeader } from './headers';

const { okta } = getConfiguration();

/**
 * Get a User session by session Id
 *
 * https://developer.okta.com/docs/reference/api/sessions/#get-session
 *
 * The Okta API returns the users session details on success or
 * returns a 404 on error.
 *
 * We convert a successful API response to a Session response,
 * or throw an error on a failed response.
 *
 * @param sessionId Okta session ID
 * @returns Promise<SessionResponse>
 */
export const getSession = async (
  sessionId: string,
): Promise<SessionResponse> => {
  const path = buildUrl('/api/v1/sessions/:sessionId', { sessionId });
  return fetch(joinUrl(okta.orgUrl, path), {
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleSessionResponse);
};

/**
 * Close a User session by session Id
 *
 * https://developer.okta.com/docs/reference/api/sessions/#close-session
 *
 * The Okta API closes the users session on success or
 * returns a 404 on invalid.
 *
 * @param sessionId Okta session ID
 * @returns Promise<boolean>
 */
export const closeSession = async (sessionId: string): Promise<undefined> => {
  const path = buildUrl('/api/v1/sessions/:sessionId', { sessionId });
  const response = await fetch(joinUrl(okta.orgUrl, path), {
    method: 'DELETE',
    headers: { ...defaultHeaders, ...authorizationHeader() },
  });

  if (!(response.ok || response.status === 404)) {
    return handleErrorResponse(response);
  }
};

export const handleSessionResponse = async (
  response: Response,
): Promise<SessionResponse> => {
  if (response.ok) {
    try {
      return sessionSchema.parse(await response.json());
    } catch (error) {
      throw new OktaError({
        message: 'Could not parse Okta session response',
      });
    }
  } else {
    return await handleErrorResponse(response);
  }
};
