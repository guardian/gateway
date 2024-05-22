import { Request } from 'express';
import { CountryCode } from '@guardian/libs';

export const maybeGetCountryCodeFromCypressMockStateCookie = (
	req: Request,
): CountryCode | null => {
	const runningInCypress = process.env.RUNNING_IN_CYPRESS === 'true';
	if (runningInCypress) {
		const cypressMockStateCookie = req.cookies['cypress-mock-state'];

		const validCode = ['FR', 'GB', 'US', 'AU'].includes(cypressMockStateCookie);

		if (validCode) {
			return cypressMockStateCookie as CountryCode;
		}
	}
	return null;
};
