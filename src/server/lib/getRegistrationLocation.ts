import { Request } from 'express';
import { CountryCode } from '@guardian/libs';
import { RegistrationLocation } from '../models/okta/User';

// TODO add tests
export const getRegistrationLocation = (
  req: Request,
  cmpConsentedAll = false,
): RegistrationLocation | undefined => {
  const country: CountryCode | undefined = req.cookies['GU_geo_country'];
  if (!cmpConsentedAll) return undefined;

  switch (country) {
    case undefined:
      return undefined;
    case 'GB':
      return 'United Kingdom';
    case 'US':
      return 'United States';
    case 'AU':
      return 'Australia';
    case 'CA':
      return 'Canada';
    case 'NZ':
      return 'New Zealand';
    default:
      return Europe.includes(country) ? 'Europe' : 'Other';
  }
};

// TODO list check content
const Europe: CountryCode[] = ['FR', 'DE'];
