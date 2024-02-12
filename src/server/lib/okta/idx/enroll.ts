import { z } from 'zod';
import { getConfiguration } from '../../getConfiguration';
import { logger } from '../../serverSideLogger';

const { okta } = getConfiguration();

const enrollResponseSchema = z.object({
	stateHandle: z.string(),
});
export type EnrollResponse = z.infer<typeof enrollResponseSchema>;

export const enroll = async (stateHandle: string) => {
	try {
		const response = await fetch(`${okta.orgUrl}/idp/idx/enroll`, {
			method: 'POST',
			headers: {
				Accept: 'application/ion+json; okta-version=1.0.0',
				'Content-Type': 'application/ion+json; okta-version=1.0.0',
			},
			body: JSON.stringify({
				stateHandle,
			}),
		});

		if (!response.ok) {
			const error = await response.text();

			throw new Error(error);
		}

		const data = await response.json();

		return enrollResponseSchema.parse(data);
	} catch (error) {
		logger.error('enroll error:', error);
		throw error;
	}
};

export const enrollWithEmail = async (stateHandle: string, email: string) => {
	try {
		const response = await fetch(`${okta.orgUrl}/idp/idx/enroll/new`, {
			method: 'POST',
			headers: {
				Accept: 'application/ion+json; okta-version=1.0.0',
				'Content-Type': 'application/ion+json; okta-version=1.0.0',
			},
			body: JSON.stringify({
				stateHandle,
				userProfile: {
					email,
					isGuardianUser: true,
				},
			}),
		});

		if (!response.ok) {
			const error = await response.text();

			throw new Error(error);
		}

		const data = await response.json();

		return enrollResponseSchema.parse(data);
	} catch (error) {
		logger.error('enroll error:', error);
		throw error;
	}
};
