import { joinUrl } from '@guardian/libs';
import { InteractResponse } from './interact';
import { getConfiguration } from '../../getConfiguration';
import { logger } from '../../serverSideLogger';
import { z } from 'zod';

const { okta } = getConfiguration();

const introspectResponseSchema = z.object({
	stateHandle: z.string(),
});
export type IntrospectResponse = z.infer<typeof introspectResponseSchema>;

export const introspect = async (
	interactionHandle: InteractResponse['interaction_handle'],
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
			const error = await response.text();
			throw new Error(error);
		}

		const data = await response.json();

		return introspectResponseSchema.parse(data);
	} catch (error) {
		logger.error('introspect error:', error);
		throw error;
	}
};
