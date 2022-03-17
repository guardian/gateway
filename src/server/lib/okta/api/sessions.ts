import { OktaError } from '@/server/models/okta/Error';
import { SessionResponse } from '@/server/models/okta/Session';
import { buildUrl, ExtractRouteParams } from '@/shared/lib/routeUtils';
import { OktaApiRoutePaths } from '@/shared/model/Routes';
import { joinUrl } from '@guardian/libs';
import { getConfiguration } from '../../getConfiguration';
import { handleErrorResponse } from './errors';
import { defaultHeaders, authorizationHeader } from './headers';
import { Response } from 'node-fetch';
import { fetch } from '@/server/lib/fetch';

const { okta } = getConfiguration();

/**
 * Get a User session by session Id
 *
 * https://developer.okta.com/docs/reference/api/sessions/#get-session
 *
 * @param sessionId Okta user ID
 * @returns Promise<void>
 */
export const getSession = async <P extends OktaApiRoutePaths>(
  sessionId: ExtractRouteParams<P>,
): Promise<SessionResponse> => {
  const path = buildUrl('/api/v1/sessions/:id', sessionId);
  return fetch(joinUrl(okta.orgUrl, path), {
    headers: { ...defaultHeaders, ...authorizationHeader() },
  }).then(handleSessionResponse);
};

const handleSessionResponse = async (
  response: Response,
): Promise<SessionResponse> => {
  if (response.ok) {
    try {
      return await response.json().then((json) => {
        const session = json as SessionResponse;
        return {
          id: session.id,
          login: session.login,
          userId: session.userId,
          expiresAt: session.expiresAt,
          status: session.status,
          lastPasswordVerification: session.lastPasswordVerification,
          lastFactorVerification: session.lastFactorVerification,
          mfaActive: session.mfaActive,
        };
      });
    } catch (error) {
      throw new OktaError({
        message: 'Could not parse Okta session response',
      });
    }
  } else {
    return await handleErrorResponse(response);
  }
};
