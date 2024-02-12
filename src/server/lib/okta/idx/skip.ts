/* eslint-disable no-console */
import { getConfiguration } from '../../getConfiguration';
import { logger } from '../../serverSideLogger';

const { okta } = getConfiguration();

export const skip = async (stateHandle: string): Promise<string> => {
	try {
		const response = await fetch(`${okta.orgUrl}/idp/idx/skip`, {
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

		const cookies = response.headers.getSetCookie();

		console.log('cookies:', cookies);

		const idxCookie = cookies.find((cookie) => cookie.startsWith('idx='));

		if (idxCookie) {
			console.log('idxCookie:', idxCookie);

			return idxCookie.replace('idx=', '');
		}

		throw new Error('IDX cookie not found');
	} catch (error) {
		logger.error('Skip error:', error);
		throw error;
	}
};

export const keepMeSignedIn = async (
	idx: string,
	stateHandle: string,
): Promise<string> => {
	try {
		const response = await fetch(`${okta.orgUrl}/idp/idx/keep-me-signed-in`, {
			method: 'POST',
			headers: {
				Accept: 'application/ion+json; okta-version=1.0.0',
				'Content-Type': 'application/ion+json; okta-version=1.0.0',
				Cookie: `idx=${idx}`,
			},
			body: JSON.stringify({
				keepMeSignedIn: true,
				stateHandle,
			}),
		});

		if (!response.ok) {
			const error = await response.text();

			throw new Error(error);
		}

		const data = await response.json();

		console.log(JSON.stringify(data, null, 2));

		return data.stateHandle;
	} catch (error) {
		logger.error('Skip error:', error);
		throw error;
	}
};
