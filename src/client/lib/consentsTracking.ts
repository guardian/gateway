import { PageData } from '@/shared/model/ClientState';
import { sendOphanInteractionEvent } from './ophan';
import { Consents } from '@/shared/model/Consent';
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
const consentsFormSubmitOphanTracking = (
	inputElems: NodeListOf<HTMLInputElement>,
	pageData: PageData,
): void => {
	const consents = pageData.consents;

	if (consents) {
		inputElems.forEach((elem) => {
			const consent = consents.find(({ id }) => id === elem.name);

			if (consent) {
				trackInputElementInteraction(elem, 'consent', consent.name);
			}
		});
	}
};

// handle newsletter form submit event
const newslettersFormSubmitOphanTracking = (
	inputElems: NodeListOf<HTMLInputElement>,
	pageData: PageData,
): void => {
	const newsletters = pageData.newsletters;

	if (newsletters) {
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
	}
};

// handle generic form (direct to one of the two below based on page)
export const onboardingFormSubmitOphanTracking = (
	page: string,
	pageData: PageData,
	target: HTMLFormElement,
): void => {
	const inputElems = target.querySelectorAll('input');

	// we add a starting slash to the page, to match the route enums
	switch (`/${page}`) {
		case '/data':
			return consentsFormSubmitOphanTracking(inputElems, pageData);
		case '/newsletters':
			consentsFormSubmitOphanTracking(inputElems, pageData);
			newslettersFormSubmitOphanTracking(inputElems, pageData);
			return;
		default:
			return;
	}
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
