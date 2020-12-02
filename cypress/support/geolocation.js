const getGeoLocationHeaders = (countryCode = 'GB') => {
  return { 'x-gu-geolocation': countryCode };
};

const GEOLOCATION_CODES = {
  GB: 'GB',
  AMERICA: 'US',
  AUSTRALIA: 'AU',
  OTHERS: 'ROW',
};

module.exports = {
  getGeoLocationHeaders,
  GEOLOCATION_CODES,
};
