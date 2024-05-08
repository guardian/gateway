import { GeoLocation } from '@/shared/model/Geolocation';
import { Request } from 'express';
import { Europe } from './getRegistrationLocation';
import { CountryCode } from '@guardian/libs';

export const getGeolocationRegion = (req: Request): GeoLocation => {
	/**
	 * Cypress Test START
	 *
	 * This code checks if we're running in Cypress
	 */
	const runningInCypress = process.env.RUNNING_IN_CYPRESS === 'true';
	if (runningInCypress) {
		const cypressMockStateCookie = req.cookies['cypress-mock-state'];

		// check if the cookie value is an expected value
		const validCode = ['FR', 'GB', 'US', 'AU'].includes(cypressMockStateCookie);

		// if it is then return the code
		if (validCode) {
			return countryCodeToRegion(cypressMockStateCookie);
		}

		// otherwise let it fall through to the default check below
	}
	/**
	 * Cypress Test END
	 */
	const header = req.headers['x-gu-geolocation'];
	return countryCodeToRegion(header);
};

const countryCodeToRegion = (
	countryCode: string | string[] | undefined,
): GeoLocation => {
	if (Europe.includes(countryCode as CountryCode)) return 'EU';
	switch (countryCode) {
		case 'GB':
			return 'GB';
		case 'US':
			return 'US';
		case 'AU':
			return 'AU';
		default:
			return 'ROW';
	}
};
