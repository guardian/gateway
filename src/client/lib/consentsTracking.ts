import { Routes } from '@/shared/model/Routes';

// handle consents form submit event
const consentsFormSubmitOphanTracking = (formData: FormData) => {
  return;
};

// handle newsletter form submit event
const newslettersFormSubmitOphanTracking = (formData: FormData) => {
  return;
};

// handle generic form (direct to one of the two below based on page)

export const onboardingFormSubmitOphanTracking = (
  page: string,
  event: React.FormEvent<HTMLFormElement>,
) => {
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  switch (page) {
    case Routes.CONSENTS_COMMUNICATION.slice(1):
    case Routes.CONSENTS_DATA.slice(1):
      return consentsFormSubmitOphanTracking(formData);
    case Routes.CONSENTS_NEWSLETTERS.slice(1):
      return newslettersFormSubmitOphanTracking(formData);
    default:
      break;
  }
};

// handle any arbitary link click
export const ophanLinkTrack = () => {
  return;
};
