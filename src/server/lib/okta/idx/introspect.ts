import { joinUrl } from '@guardian/libs';
import { InteractResponse } from './interact';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/serverSideLogger';
import { z } from 'zod';
import { OAuthError } from '@/server/models/okta/Error';

const { okta } = getConfiguration();

// Schema for the 'redirect-idp' object inside the introspect response remediation object
export const redirectIdpSchema = z.object({
	name: z.literal('redirect-idp'),
	type: z.enum(['APPLE', 'GOOGLE']),
	href: z.string().url(),
	method: z.literal('GET'),
});

// Schema for the introspect response
const introspectResponseSchema = z.object({
	stateHandle: z.string(),
	expiresAt: z.coerce.date(),
	remediation: z.object({
		type: z.string(),
		value: z.array(
			// social idp object
			z.union([
				redirectIdpSchema,
				z.object({
					// any other name thats not one of the above
					name: z.string(),
					type: z.string().optional(),
					href: z.string().optional(),
					method: z.string().optional(),
				}),
			]),
		),
	}),
});
export type IntrospectResponse = z.infer<typeof introspectResponseSchema>;

const introspectResponseErrorSchema = z.object({
	version: z.literal('1.0.0'),
	messages: z.object({
		type: z.literal('array'),
		value: z.array(
			z.object({
				message: z.string(),
				i18n: z.object({ key: z.string() }),
			}),
		),
	}),
});

/**
 * @name introspect
 * @description Okta IDX API/Interaction Code flow - Step 2: Use the interaction handle generated from the `interact` step to start the authentication process.
 *
 * The introspect step lets us know what kind of authentication we can perform (remediation),
 * and what the next steps are. It also returns the `stateHandle` which identifies the current
 * state of the authentication process, and should be preserved and used in any subsequent requests
 * in the flow.
 *
 * @param interactionHandle - The interaction handle returned from the `interact` step
 * @param request_id - The request id
 * @returns Promise<IntrospectResponse> - The introspect response
 */
export const introspect = async (
	interactionHandle: InteractResponse['interaction_handle'],
	request_id?: string,
): Promise<IntrospectResponse> => {
	try {
		const response = await fetch(joinUrl(okta.orgUrl, '/idp/idx/introspect'), {
			method: 'POST',
			headers: {
				Accept: 'application/ion+json; okta-version=1.0.0',
				'Content-Type': 'application/ion+json; okta-version=1.0.0',
			},
			body: JSON.stringify({
				interactionHandle,
			}),
		});

		if (!response.ok) {
			await handleError(response);
		}

		const data = await response.json();

		return introspectResponseSchema.parse(data);
	} catch (error) {
		logger.error('Error - Okta IDX introspect:', error, {
			request_id,
		});

		throw error;
	}
};

const handleError = async (response: Response) => {
	// Check if the body is likely json using the content-type header
	const contentType = response.headers.get('content-type');
	if (
		contentType &&
		(contentType.includes('application/json') ||
			contentType.includes('application/ion+json'))
	) {
		// if so, parse the body as json and see if it matches the schema
		const json = await response.json().catch((e) => {
			throw new OAuthError(
				{
					error: 'invalid_json',
					error_description: e.message,
				},
				response.status,
			);
		});
		const error = introspectResponseErrorSchema.safeParse(json);

		if (error.success) {
			throw new OAuthError(
				{
					error: error.data.messages.value[0].i18n.key,
					error_description: error.data.messages.value[0].message,
				},
				response.status,
			);
		} else {
			throw new OAuthError(
				{
					error: 'unknown_error',
					error_description: JSON.stringify(json),
				},
				response.status,
			);
		}
	}

	throw new OAuthError(
		{
			error: 'unknown_error',
			error_description: await response.text(),
		},
		response.status,
	);
};
