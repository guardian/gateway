import type { CountryCode } from '@guardian/libs';
import type { Request } from 'express';
import { maybeGetCountryCodeFromCypressMockStateCookie } from '@/server/lib/cypress';
import { Europe } from '@/server/lib/getRegistrationLocation';
import type { GeoLocation } from '@/shared/model/Geolocation';

export const getGeolocationRegion = (req: Request): GeoLocation => {
	/**
	 * Cypress Test START
	 */
	const maybeMockedCountryCode =
		maybeGetCountryCodeFromCypressMockStateCookie(req);
	if (maybeMockedCountryCode)
		return countryCodeToRegion(maybeMockedCountryCode);
	/**
	 * Cypress Test END
	 */
	const header = req.headers['x-gu-geolocation'];
	return countryCodeToRegion(header);
};

export const countryCodeToRegion = (
	countryCode: string | string[] | undefined,
): GeoLocation => {
	if (Europe.includes(countryCode as CountryCode)) return 'EU';
	switch (countryCode) {
		case 'GB':
		case 'US':
		case 'AU':
			return countryCode as GeoLocation;
		default:
			return 'ROW';
	}
};
