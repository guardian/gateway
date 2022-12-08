import React from 'react';
import { SerializedStyles } from '@emotion/react';

import useClientState from '@/client/lib/hooks/useClientState';
import { onboardingFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { CmpConsentedStateHiddenInput } from '@/client/components/CmpConsentStateHiddenInput';
import { useCmpConsent } from '@/client/lib/hooks/useCmpConsent';

interface ConsentsFormProps {
  cssOverrides?: SerializedStyles;
  action?: string;
}

export const ConsentsForm: React.FC<ConsentsFormProps> = ({
  children,
  cssOverrides,
}) => {
  const hasCmpConsent = useCmpConsent();
  const clientState = useClientState();
  const { pageData = {}, queryParams } = clientState;
  const { page = '' } = pageData;

  return (
    <form
      css={cssOverrides}
      action={buildUrlWithQueryParams('/consents/:page', { page }, queryParams)}
      method="post"
      onSubmit={({ target: form }) => {
        onboardingFormSubmitOphanTracking(
          page,
          pageData,
          // have to explicitly type as HTMLFormElement as typescript can't infer type of the event.target
          form as HTMLFormElement,
        );
      }}
    >
      <CmpConsentedStateHiddenInput cmpConsentedState={hasCmpConsent} />
      <CsrfFormField />
      {children}
    </form>
  );
};
