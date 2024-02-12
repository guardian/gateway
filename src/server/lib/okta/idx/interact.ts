import { logger } from '@/server/lib/serverSideLogger';
import { generators } from 'openid-client';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { ProfileOpenIdClientRedirectUris } from '../openid-connect';
import { scopesForAuthentication } from '../oauth';
import { joinUrl } from '@guardian/libs';
import { z } from 'zod';

const { okta } = getConfiguration();

const interactResponseSchema = z.object({
	interaction_handle: z.string(),
});
export type InteractResponse = z.infer<typeof interactResponseSchema>;

export const interact = async (
	codeVerifier: string,
	state: string,
): Promise<InteractResponse> => {
	try {
		// generate the code verifier and code challenge for PKCE
		// see https://www.oauth.com/oauth2-servers/pkce/authorization-request/
		// the `code_verifier` is a cryptographically random string
		// the `code_challenge` is the `code_verifier` hashed with SHA-256 and then base64url encoded

		const codeChallenge = generators.codeChallenge(codeVerifier);

		const authorizationParams = new URLSearchParams();

		authorizationParams.set('client_id', okta.clientId);
		authorizationParams.set('code_challenge', codeChallenge);
		authorizationParams.set('code_challenge_method', 'S256');
		authorizationParams.set(
			'redirect_uri',
			ProfileOpenIdClientRedirectUris.AUTHENTICATION,
		);
		authorizationParams.set('state', state);
		authorizationParams.set('scope', scopesForAuthentication.join(' '));

		const response = await fetch(
			joinUrl(okta.orgUrl, '/oauth2/', okta.authServerId, '/v1/interact'),
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: authorizationParams.toString(),
			},
		);

		if (!response.ok) {
			const error = await response.text();
			throw new Error(error);
		}

		return interactResponseSchema.parse(await response.json());
	} catch (error) {
		logger.error('interact error:', error);
		throw error;
	}
};
