import { GeoLocation } from '@/shared/model/Geolocation';
import { Request } from 'express';
import { Europe } from '@/server/lib/getRegistrationLocation';
import { CountryCode } from '@guardian/libs';
import { maybeGetCountryCodeFromPlaywrightMockStateCookie } from '@/server/lib/playwright';

export const getGeolocationRegion = (req: Request): GeoLocation => {
	/**
	 * Playwright Test START
	 */
	const [maybeMockedCountryCode] =
		maybeGetCountryCodeFromPlaywrightMockStateCookie(req);
	if (maybeMockedCountryCode) {
		return countryCodeToRegion(maybeMockedCountryCode);
	}
	/**
	 * Playwright Test END
	 */
	const header = req.headers['x-gu-geolocation'];
	return countryCodeToRegion(header);
};

const countryCodeToRegion = (
	countryCode: string | string[] | undefined,
): GeoLocation => {
	if (Europe.includes(countryCode as CountryCode)) {
		return 'EU';
	}
	switch (countryCode) {
		case 'GB':
		case 'US':
		case 'AU':
			return countryCode as GeoLocation;
		default:
			return 'ROW';
	}
};
