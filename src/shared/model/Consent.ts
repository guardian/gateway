export interface Consent {
	id: string;
	name: string;
	description?: string;
	consented?: boolean;
}

export enum Consents {
	ADVERTISING = 'personalised_advertising',
	// OPT OUT API CONSENTS (modeled as opt ins in Gateway)
	PROFILING = 'profiling_optin',
	// PRODUCT CONSENTS
	EVENTS = 'events',
	SIMILAR_GUARDIAN_PRODUCTS = 'similar_guardian_products',
	JOBS = 'jobs',
}

export const CONSENTS_DATA_PAGE: string[] = [
	Consents.PROFILING, // modelled as an opt in in Gateway
	Consents.ADVERTISING,
];

export const RegistrationConsentsFormFields = {
	similarGuardianProducts: {
		id: Consents.SIMILAR_GUARDIAN_PRODUCTS,
		label:
			'Receive information on our products and ways to support and enjoy our journalism. Toggle to opt out.',
	},
	jobs: {
		title: 'Guardian Jobs newsletter',
		id: Consents.JOBS,
		label:
			'Find your next job with the Guardian Jobs weekly email. Get the latest job listings, as well as tips and advice on taking your next career step. Toggle to opt out.',
	},
};
