import { abTestApiForMvtId } from '@/shared/model/experiments/abTests';
import { abSimplifyRegistrationFlowTest } from '@/shared/model/experiments/tests/abSimplifyRegistrationFlowTest';

const ab = abTestApiForMvtId(1);

const isInABTestVariant = ab.isUserInVariant(
	abSimplifyRegistrationFlowTest.id,
	abSimplifyRegistrationFlowTest.variants[0].id,
);

export enum CONSENTS_PAGES {
	DETAILS = 'Your details',
	YOUR_DATA = 'Your data',
	CONTACT = 'Stay in touch',
	NEWSLETTERS = 'Newsletters',
	OUR_CONTENT = 'Our content',
	REVIEW = 'Review',
}

const getConsentsPageArr = () => {
	if (isInABTestVariant)
		return [
			CONSENTS_PAGES.DETAILS,
			CONSENTS_PAGES.OUR_CONTENT,
			CONSENTS_PAGES.YOUR_DATA,
		];
	else
		return [
			CONSENTS_PAGES.DETAILS,
			CONSENTS_PAGES.CONTACT,
			CONSENTS_PAGES.NEWSLETTERS,
			CONSENTS_PAGES.YOUR_DATA,
		];
};

export const CONSENTS_PAGES_ARR = getConsentsPageArr();
