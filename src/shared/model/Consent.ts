import { chooseNewsletter } from './Newsletter';
import { GeoLocation } from './Geolocation';
import { AppName } from '../lib/appNameUtils';

export interface Consent {
	id: string;
	name: string;
	description?: string;
	consented?: boolean;
}

export const Consents = {
	ADVERTISING: 'personalised_advertising',
	// OPT OUT API CONSENTS (modeled as opt ins in Gateway)
	PROFILING: 'profiling_optin',
	// PRODUCT CONSENTS
	SIMILAR_GUARDIAN_PRODUCTS: 'similar_guardian_products',
	JOBS: 'jobs',
} as const;

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

interface RegistrationConsentsList {
	id: string;
	title?: string;
	description: string;
	consentOrNewsletter: 'CONSENT' | 'NEWSLETTER';
}

export const getRegistrationConsentsList = (
	isJobs: boolean,
	geolocation?: GeoLocation,
	appName?: AppName,
): Array<RegistrationConsentsList> => {
	const registrationNewsletter = chooseNewsletter({
		geolocation,
		appName,
		isJobs,
	});
	const showMarketingConsent = !isJobs;

	const isRegistrationConsentsListItem = (
		listItem: RegistrationConsentsList | false,
	): listItem is RegistrationConsentsList => {
		return (listItem as RegistrationConsentsList).id !== undefined;
	};

	return [
		isJobs &&
			({
				id: RegistrationConsentsFormFields.jobs.id,
				title: RegistrationConsentsFormFields.jobs.title,
				description: RegistrationConsentsFormFields.jobs.label,
				consentOrNewsletter: 'CONSENT',
			} as const),
		typeof registrationNewsletter === 'object' &&
			({
				id: registrationNewsletter.id,
				title: registrationNewsletter.label,
				description: registrationNewsletter.context,
				consentOrNewsletter: 'NEWSLETTER',
			} as const),
		showMarketingConsent &&
			({
				id: RegistrationConsentsFormFields.similarGuardianProducts.id,
				description:
					RegistrationConsentsFormFields.similarGuardianProducts.label,
				consentOrNewsletter: 'CONSENT',
			} as const),
	].filter((listItem) => {
		return isRegistrationConsentsListItem(listItem);
	});
};
