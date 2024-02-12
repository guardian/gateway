/* eslint-disable no-console */
import { z } from 'zod';
import { getConfiguration } from '../../getConfiguration';
import { logger } from '../../serverSideLogger';

const challengeResponseSchema = z.object({
	stateHandle: z.string(),
});
export type ChallengeResponseSchema = z.infer<typeof challengeResponseSchema>;

const { okta } = getConfiguration();

export const challengeAnswerPasscode = async (
	stateHandle: string,
	passcode: string,
): Promise<ChallengeResponseSchema> => {
	try {
		const response = await fetch(`${okta.orgUrl}/idp/idx/challenge/answer`, {
			method: 'POST',
			headers: {
				Accept: 'application/ion+json; okta-version=1.0.0',
				'Content-Type': 'application/ion+json; okta-version=1.0.0',
			},
			body: JSON.stringify({
				stateHandle,
				credentials: {
					passcode,
				},
			}),
		});

		if (!response.ok) {
			const error = await response.text();

			console.log(JSON.stringify(JSON.parse(error), null, 2));

			throw new Error(error);
		}

		const data = await response.json();

		console.log(JSON.stringify(data, null, 2));

		return challengeResponseSchema.parse(data);
	} catch (error) {
		logger.error('challengeAnswerPasscode error:', error);
		throw error;
	}
};
