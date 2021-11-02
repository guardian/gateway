export const getGeoLocationHeaders = (countryCode = 'GB') => {
  return { 'x-gu-geolocation': countryCode };
};

export const GEOLOCATION_CODES = {
  GB: 'GB',
  AMERICA: 'US',
  AUSTRALIA: 'AU',
  OTHERS: 'ROW',
};
