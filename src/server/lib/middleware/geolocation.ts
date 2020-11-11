import { NextFunction, Request } from 'express';
import { ResponseWithLocals } from '@/server/models/Express';
import { GeoLocation } from '@/shared/model/Geolocation';

export const geolocationMiddleware = (
  req: Request,
  res: ResponseWithLocals,
  next: NextFunction,
) => {
  const header = req.headers['x-gu-geolocation'];

  let geolocation: GeoLocation;

  switch (header) {
    case 'GB':
      geolocation = 'GB';
      break;
    case 'US':
      geolocation = 'US';
      break;
    case 'AU':
      geolocation = 'AU';
      break;
    default:
      geolocation = 'ROW';
      break;
  }

  res.locals.pageData.geolocation = geolocation;

  next();
};
