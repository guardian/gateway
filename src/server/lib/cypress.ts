import { Request } from 'express';
import { CountryCode } from '@guardian/libs';

export const maybeGetCountryCodeFromCypressMockStateCookie = (
	req: Request,
): [CountryCode | undefined, string | undefined] => {
	const runningInCypress = process.env.RUNNING_IN_CYPRESS === 'true';
	if (runningInCypress) {
		const cypressMockStateCookie = req.cookies['cypress-mock-state'];

		const validCountryOnlyCode = ['FR', 'GB', 'US', 'AU'].includes(
			cypressMockStateCookie,
		);

		if (validCountryOnlyCode) {
			return [cypressMockStateCookie as CountryCode, undefined];
		}

		const validCountryCodeWithState = ['AU-ACT'].includes(
			cypressMockStateCookie,
		);

		if (validCountryCodeWithState) {
			return [
				cypressMockStateCookie.split('-')[0] as CountryCode,
				cypressMockStateCookie.split('-')[1],
			];
		}
	}
	return [undefined, undefined];
};
