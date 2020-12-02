import { NextFunction, Request } from 'express';
import { ResponseWithServerStateLocals } from '@/server/models/Express';
import { getGeolocationRegion } from '@/server/lib/getGeolocationRegion';

export const geolocationMiddleware = (
  req: Request,
  res: ResponseWithServerStateLocals,
  next: NextFunction,
) => {
  res.locals.pageData.geolocation = getGeolocationRegion(req);
  next();
};
