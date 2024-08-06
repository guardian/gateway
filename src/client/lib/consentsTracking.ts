import { sendOphanInteractionEvent } from '@/client/lib/ophan';
import type { Consent } from '@/shared/model/Consent';
import { Consents } from '@/shared/model/Consent';
import type { NewsLetter } from '@/shared/model/Newsletter';
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

// handle consents form submit event
export const consentsFormSubmitOphanTracking = (
	target: HTMLFormElement,
	consents?: Consent[],
) => {
	if (!consents?.length) {
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

// handle newsletter form submit event
export const newslettersFormSubmitOphanTracking = (
	target: HTMLFormElement,
	newsletters?: NewsLetter[],
): void => {
	if (!newsletters?.length) {
		return;
	}

	const inputElems = target.querySelectorAll('input');
	inputElems.forEach((elem) => {
		const newsletter = newsletters.find(({ id }) => id === elem.name);

		if (newsletter) {
			// if previously subscribed AND now wants to unsubscribe
			// OR if previously not subscribed AND wants to subscribe
			// then do the trackInputElementInteraction
			if (
				(newsletter.subscribed && !elem.checked) ||
				(!newsletter.subscribed && elem.checked)
			) {
				trackInputElementInteraction(elem, 'newsletter', newsletter.nameId);
			}
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
				case Newsletters.AU_BUNDLE:
					trackInputElementInteraction(elem, 'newsletter', 'au-bundle');
					break;
				case Newsletters.US_BUNDLE:
					trackInputElementInteraction(elem, 'newsletter', 'us-bundle');
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
