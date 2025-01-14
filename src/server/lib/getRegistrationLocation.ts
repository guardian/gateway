import { Request } from 'express';
import { CountryCode } from '@guardian/libs';
import { RegistrationLocation } from '@/shared/model/RegistrationLocation';
import { maybeGetCountryCodeFromCypressMockStateCookie } from '@/server/lib/cypress';

const headerValueIsCountryCode = (
	header: string | string[] | undefined,
): header is CountryCode => typeof header === 'string' && header.length === 2;

/**
 * The registrationLocation regions are derived from the first column (region_code)
 * of the Data Design team regional classifications here:
 * https://github.com/guardian/data-platform-models/blob/1f21699dd8a3609ee158e74daee79a58f4e7ebc1/dbt/data/seed_country.csv
 *
 * The registrationLocation field is stored in Okta and can by changed by user via ManageMyAccount.
 */
export const getRegistrationLocation = (
	req: Request,
): RegistrationLocation | undefined => {
	/**
	 * Cypress Test START
	 */
	const maybeMockedCountryCode =
		maybeGetCountryCodeFromCypressMockStateCookie(req);
	if (maybeMockedCountryCode) {
		return countryCodeToRegistrationLocation(maybeMockedCountryCode);
	}
	/**
	 * Cypress Test END
	 */
	const header = req.headers['x-gu-geolocation'];
	if (!headerValueIsCountryCode(header)) {
		return undefined;
	}
	return countryCodeToRegistrationLocation(header);
};

const countryCodeToRegistrationLocation = (
	countryCode: CountryCode,
): RegistrationLocation | undefined => {
	if (countryCode === 'GB') {
		return 'United Kingdom';
	}
	if (Us.includes(countryCode)) {
		return 'United States';
	}
	if (countryCode === 'AU') {
		return 'Australia';
	}
	if (countryCode === 'NZ') {
		return 'New Zealand';
	}
	if (countryCode === 'CA') {
		return 'Canada';
	}
	if (Europe.includes(countryCode)) {
		return 'Europe';
	}
	if (Row.includes(countryCode)) {
		return 'Other';
	}

	return undefined;
};

const Us: Array<CountryCode | undefined> = ['US', 'AS', 'GU', 'MP', 'PR', 'VI'];

// This is a list of all the countries in Europe, as defined by the Data Design team.
// This is also used by getGeoLocationRegion.ts to determine if a user is in Europe.
export const Europe: Array<CountryCode | undefined> = [
	'AX',
	'AL',
	'AD',
	'AT',
	'BE',
	'BG',
	'BA',
	'BY',
	'CH',
	'CZ',
	'DE',
	'DK',
	'ES',
	'EE',
	'FI',
	'FR',
	'FO',
	'GG',
	'GI',
	'GR',
	'HR',
	'HU',
	'IM',
	'IE',
	'IS',
	'IT',
	'JE',
	'LI',
	'LT',
	'LU',
	'LV',
	'MC',
	'MD',
	'MK',
	'MT',
	'ME',
	'NL',
	'NO',
	'PL',
	'PT',
	'RO',
	'RU',
	'SJ',
	'SM',
	'RS',
	'SK',
	'SI',
	'SE',
	'UA',
	'VA',
];

const Row: Array<CountryCode | undefined> = [
	'AW',
	'AF',
	'AO',
	'AI',
	'AE',
	'AR',
	'AM',
	'AQ',
	'TF',
	'AG',
	'AZ',
	'BI',
	'BJ',
	'BQ',
	'BF',
	'BD',
	'BH',
	'BS',
	'BL',
	'BZ',
	'BM',
	'BO',
	'BR',
	'BB',
	'BN',
	'BT',
	'BV',
	'BW',
	'CF',
	'CC',
	'CL',
	'CN',
	'CI',
	'CM',
	'CD',
	'CG',
	'CK',
	'CO',
	'KM',
	'CV',
	'CR',
	'CU',
	'CW',
	'CX',
	'KY',
	'CY',
	'DJ',
	'DM',
	'DO',
	'DZ',
	'EC',
	'EG',
	'ER',
	'EH',
	'ET',
	'FJ',
	'FK',
	'FM',
	'GA',
	'GE',
	'GH',
	'GN',
	'GP',
	'GM',
	'GW',
	'GQ',
	'GD',
	'GL',
	'GT',
	'GF',
	'GY',
	'HK',
	'HM',
	'HN',
	'HT',
	'ID',
	'IN',
	'IO',
	'IR',
	'IQ',
	'IL',
	'JM',
	'JO',
	'JP',
	'KZ',
	'KE',
	'KG',
	'KH',
	'KI',
	'KN',
	'KR',
	'KW',
	'LA',
	'LB',
	'LR',
	'LY',
	'LC',
	'LK',
	'LS',
	'MO',
	'MF',
	'MA',
	'MG',
	'MV',
	'MX',
	'MH',
	'ML',
	'MM',
	'MN',
	'MZ',
	'MR',
	'MS',
	'MQ',
	'MU',
	'MW',
	'MY',
	'YT',
	'NA',
	'NC',
	'NE',
	'NF',
	'NG',
	'NI',
	'NU',
	'NP',
	'NR',
	'OM',
	'PK',
	'PA',
	'PN',
	'PE',
	'PH',
	'PW',
	'PG',
	'KP',
	'PY',
	'PS',
	'PF',
	'QA',
	'RE',
	'RW',
	'SA',
	'SD',
	'SN',
	'SG',
	'GS',
	'SH',
	'SB',
	'SL',
	'SV',
	'SO',
	'PM',
	'SS',
	'ST',
	'SR',
	'SZ',
	'SX',
	'SC',
	'SY',
	'TC',
	'TD',
	'TG',
	'TH',
	'TJ',
	'TK',
	'TM',
	'TL',
	'TO',
	'TT',
	'TN',
	'TR',
	'TV',
	'TW',
	'TZ',
	'UG',
	'UM',
	'UY',
	'UZ',
	'VC',
	'VE',
	'VG',
	'VN',
	'VU',
	'WF',
	'WS',
	'YE',
	'ZA',
	'ZM',
	'ZW',
];
