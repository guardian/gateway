export enum CONSENTS_PAGES {
	DETAILS = 'Your details',
	YOUR_DATA = 'Your data',
	CONTACT = 'Stay in touch',
	NEWSLETTERS = 'Newsletters',
	//@AB_TEST: 3 Stage Registration Flow Test
	OUR_CONTENT = 'Our content',
	REVIEW = 'Review',
}
//@AB_TEST: 3 Stage Registration Flow Test
export const getConsentsPageArr = (isInABTestVariant: boolean) => {
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
