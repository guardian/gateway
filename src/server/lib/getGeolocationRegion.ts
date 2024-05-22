import { GeoLocation } from '@/shared/model/Geolocation';
import { Request } from 'express';
import { Europe } from '@/server/lib/getRegistrationLocation';
import { CountryCode } from '@guardian/libs';
import { maybeGetCountryCodeFromCypressMockStateCookie } from '@/server/lib/cypress';

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
