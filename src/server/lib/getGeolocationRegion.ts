import { Request } from 'express';
import { GeoLocation } from '@/shared/model/Geolocation';

export const getGeolocationRegion = (req: Request): GeoLocation => {
  const header = req.headers['x-gu-geolocation'];
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
