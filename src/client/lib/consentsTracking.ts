import { PageData } from '@/shared/model/GlobalState';
import { Routes } from '@/shared/model/Routes';
import { sendOphanInteractionEvent } from './ophan';

const trackInputElementInteraction = (
  inputElem: HTMLInputElement,
  component: string,
  consentName: string,
) => {
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
) => {
  const consents = pageData.consents;

  if (consents) {
    inputElems.forEach((elem) => {
      const consent = consents.find((c) => c.id === elem.name);

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
) => {
  const newsletters = pageData.newsletters;

  if (newsletters) {
    inputElems.forEach((elem) => {
      const newsletter = newsletters.find((c) => c.id === elem.name);

      if (newsletter) {
        trackInputElementInteraction(elem, 'newsletter', newsletter.nameId);
      }
    });
  }
};

// handle generic form (direct to one of the two below based on page)
export const onboardingFormSubmitOphanTracking = (
  page: string,
  pageData: PageData,
  event: React.FormEvent<HTMLFormElement>,
) => {
  const form = event.target as HTMLFormElement;
  const inputElems = form.querySelectorAll('input');

  switch (page) {
    case Routes.CONSENTS_COMMUNICATION.slice(1):
    case Routes.CONSENTS_DATA.slice(1):
      return consentsFormSubmitOphanTracking(inputElems, pageData);
    case Routes.CONSENTS_NEWSLETTERS.slice(1):
      return newslettersFormSubmitOphanTracking(inputElems, pageData);
    default:
      break;
  }
};
