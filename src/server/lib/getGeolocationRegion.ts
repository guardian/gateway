import { GeoLocation } from '@/shared/model/Geolocation';
import { Request } from 'express';
import { Europe } from './getRegistrationLocation';
import { CountryCode } from '@guardian/libs';

export const getGeolocationRegion = (req: Request): GeoLocation => {
	const header = req.headers['x-gu-geolocation'];
	// const country: CountryCode | undefined = req.cookies['GU_geo_country'];

	if (Europe.includes(header as CountryCode)) return 'EU';

	switch (header) {
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
