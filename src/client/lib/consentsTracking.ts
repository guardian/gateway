import { sendOphanInteractionEvent } from './ophan';
import { Consent, Consents } from '@/shared/model/Consent';
import { Newsletters } from '@/shared/model/Newsletter';

const trackInputElementInteraction = (
	inputElem: HTMLInputElement,
	component: string,
	consentName: string,
): void => {
	if (inputElem.type === 'checkbox') {
		sendOphanInteractionEvent({
			component: `identity-onboarding-${component}`,
			value: `${consentName} : ${inputElem.checked}`,
		});
	}

	if (inputElem.type === 'radio' && inputElem.checked) {
		sendOphanInteractionEvent({
			component: `identity-onboarding-${component}`,
			value: `${consentName} : ${inputElem.value}`,
		});
	}
};

export const consentsFormSubmitOphanTracking = (
	target: HTMLFormElement,
	consents: Consent[],
): void => {
	if (!consents.length) {
		return;
	}

	const inputElems = target.querySelectorAll('input');
	inputElems.forEach((elem) => {
		const consent = consents.find(({ id }) => id === elem.name);

		if (consent) {
			trackInputElementInteraction(elem, 'consent', consent.name);
		}
	});
};

// handle registration form submit event on /register/email page and welcome/:social page
// we have to manually track the consents and newsletters here, and manually set the values
// for any new consents or newsletters added in the future
export const registrationFormSubmitOphanTracking = (
	target: HTMLFormElement,
): void => {
	const inputElems = target.querySelectorAll('input');

	inputElems.forEach((elem) => {
		if (elem.type === 'checkbox') {
			switch (elem.name) {
				case Newsletters.SATURDAY_EDITION:
					trackInputElementInteraction(elem, 'newsletter', 'saturday-edition');
					break;
				case Consents.SIMILAR_GUARDIAN_PRODUCTS:
					trackInputElementInteraction(
						elem,
						'consent',
						'similar-guardian-products',
					);
					break;
			}
		}
	});
};
