import { Request } from 'express';
import { CountryCode } from '@guardian/libs';

export const maybeGetCountryCodeFromPlaywrightMockStateCookie = (
	req: Request,
): [CountryCode | undefined, string | undefined] => {
	const runningInPlaywright = process.env.RUNNING_IN_PLAYWRIGHT === 'true';
	if (runningInPlaywright) {
		const playwrightMockStateCookie = req.cookies['playwright-mock-state'];

		const validCountryOnlyCode = ['FR', 'GB', 'US', 'AU'].includes(
			playwrightMockStateCookie,
		);

		if (validCountryOnlyCode) {
			return [playwrightMockStateCookie as CountryCode, undefined];
		}

		const validCountryCodeWithState = ['AU-ACT'].includes(
			playwrightMockStateCookie,
		);

		if (validCountryCodeWithState) {
			return [
				playwrightMockStateCookie.split('-')[0] as CountryCode,
				playwrightMockStateCookie.split('-')[1],
			];
		}
	}
	return [undefined, undefined];
};
