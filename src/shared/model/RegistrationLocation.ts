import { z } from 'zod';

export const RegistrationLocationSchema = z.enum([
	'Prefer not to say',
	'United Kingdom',
	'Europe',
	'United States',
	'Canada',
	'Australia',
	'New Zealand',
	'Other',
]);

export type RegistrationLocation = z.infer<typeof RegistrationLocationSchema>;

/**
 * From following Data Design team classifications:
 * https://github.com/guardian/data-platform-models/blob/1f21699dd8a3609ee158e74daee79a58f4e7ebc1/dbt/data/seed_country_subdivision.csv
 *
 * Like registrationLocation, registrationLocationState is stored in Okta and can be changed by user via ManageMyAccount.
 *
 */
export const RegistrationLocationStateSchema = z.enum([
	// Australia - https://en.wikipedia.org/wiki/ISO_3166-2:AU
	// Australian States
	'New South Wales', // AU-NSW
	'Victoria', // AU-VIC
	'Queensland', // AU-QLD
	'South Australia', // AU-SA
	'Western Australia', // AU-WA
	'Tasmania', // AU-TAS
	// Australian Territories
	'Australian Capital Territory', // AU-ACT
	'Northern Territory', // AU-NT
	// United States - https://en.wikipedia.org/wiki/ISO_3166-2:US
	// US States
	'Alabama', // US-AL
	'Alaska', // US-AK
	'Arizona', // US-AZ
	'Arkansas', // US-AR
	'California', // US-CA
	'Colorado', // US-CO
	'Connecticut', // US-CT
	'Delaware', // US-DE
	'Florida', // US-FL
	'Georgia', // US-GA
	'Hawaii', // US-HI
	'Idaho', // US-ID
	'Illinois', // US-IL
	'Indiana', // US-IN
	'Iowa', // US-IA
	'Kansas', // US-KS
	'Kentucky', // US-KY
	'Louisiana', // US-LA
	'Maine', // US-ME
	'Maryland', // US-MD
	'Massachusetts', // US-MA
	'Michigan', // US-MI
	'Minnesota', // US-MN
	'Mississippi', // US-MS
	'Missouri', // US-MO
	'Montana', // US-MT
	'Nebraska', // US-NE
	'Nevada', // US-NV
	'New Hampshire', // US-NH
	'New Jersey', // US-NJ
	'New Mexico', // US-NM
	'New York', // US-NY
	'North Carolina', // US-NC
	'North Dakota', // US-ND
	'Ohio', // US-OH
	'Oklahoma', // US-OK
	'Oregon', // US-OR
	'Pennsylvania', // US-PA
	'Rhode Island', // US-RI
	'South Carolina', // US-SC
	'South Dakota', // US-SD
	'Tennessee', // US-TN
	'Texas', // US-TX
	'Utah', // US-UT
	'Vermont', // US-VT
	'Virginia', // US-VA
	'Washington', // US-WA
	'West Virginia', // US-WV
	'Wisconsin', // US-WI
	'Wyoming', // US-WY
	// US Districts
	'District of Columbia', // US-DC
	// US Outlying Areas
	'American Samoa', // US-AS
	'Guam', // US-GU
	'Northern Mariana Islands', // US-MP
	'Puerto Rico', // US-PR
	'United States Minor Outlying Islands', // US-UM
	'Virgin Islands', // US-VI
	// General
	'Other', // Other
	'Prefer not to say', // Prefer not to say
	'', // Empty string - for when the user has manually changed their location from AU or US to something else, where we need to set it to empty
]);

export type RegistrationLocationState = z.infer<
	typeof RegistrationLocationStateSchema
>;

// Australia - https://en.wikipedia.org/wiki/ISO_3166-2:AU
export const AuStates: Record<string, RegistrationLocationState> = {
	// Australian States
	NSW: 'New South Wales',
	VIC: 'Victoria',
	QLD: 'Queensland',
	SA: 'South Australia',
	WA: 'Western Australia',
	TAS: 'Tasmania',
	// Australian Territories
	ACT: 'Australian Capital Territory',
	NT: 'Northern Territory',
};

// United States - https://en.wikipedia.org/wiki/ISO_3166-2:US
export const UsStates: Record<string, RegistrationLocationState> = {
	// US States
	AL: 'Alabama',
	AK: 'Alaska',
	AZ: 'Arizona',
	AR: 'Arkansas',
	CA: 'California',
	CO: 'Colorado',
	CT: 'Connecticut',
	DE: 'Delaware',
	FL: 'Florida',
	GA: 'Georgia',
	HI: 'Hawaii',
	ID: 'Idaho',
	IL: 'Illinois',
	IN: 'Indiana',
	IA: 'Iowa',
	KS: 'Kansas',
	KY: 'Kentucky',
	LA: 'Louisiana',
	ME: 'Maine',
	MD: 'Maryland',
	MA: 'Massachusetts',
	MI: 'Michigan',
	MN: 'Minnesota',
	MS: 'Mississippi',
	MO: 'Missouri',
	MT: 'Montana',
	NE: 'Nebraska',
	NV: 'Nevada',
	NH: 'New Hampshire',
	NJ: 'New Jersey',
	NM: 'New Mexico',
	NY: 'New York',
	NC: 'North Carolina',
	ND: 'North Dakota',
	OH: 'Ohio',
	OK: 'Oklahoma',
	OR: 'Oregon',
	PA: 'Pennsylvania',
	RI: 'Rhode Island',
	SC: 'South Carolina',
	SD: 'South Dakota',
	TN: 'Tennessee',
	TX: 'Texas',
	UT: 'Utah',
	VT: 'Vermont',
	VA: 'Virginia',
	WA: 'Washington',
	WV: 'West Virginia',
	WI: 'Wisconsin',
	WY: 'Wyoming',
	// US Districts
	DC: 'District of Columbia',
	// US Outlying Areas
	AS: 'American Samoa',
	GU: 'Guam',
	MP: 'Northern Mariana Islands',
	PR: 'Puerto Rico',
	UM: 'United States Minor Outlying Islands',
	VI: 'Virgin Islands',
};
