import React from 'react';
import { css } from '@emotion/react';

import { until } from '@guardian/source-foundations';
import { Button } from '@guardian/source-react-components';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { GeoLocation } from '@/shared/model/Geolocation';
import { Consent } from '@/shared/model/Consent';
import { ConsentCard } from '@/client/components/ConsentCard';
import { controls } from '@/client/styles/Consents';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { onboardingFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import useClientState from '@/client/lib/hooks/useClientState';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';

const continueButtonWrapper = css`
  text-align: right;
`;

const continueButton = css`
  ${until.tablet} {
    width: 100%;
    justify-content: center;
  }
`;

type SignInSuccessProps = {
  geolocation?: GeoLocation;
  consents: Consent[];
};

export const SignInSuccess = ({ consents }: SignInSuccessProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  const clientState = useClientState();
  const { pageData = {}, queryParams } = clientState;

  return (
    <ConsentsLayout title="Get the latest offers sent to your inbox">
      <form
        css={autoRow()}
        action={buildUrlWithQueryParams('/signin/success', {}, queryParams)}
        method="post"
        onSubmit={({ target: form }) => {
          onboardingFormSubmitOphanTracking(
            'signin/success',
            pageData,
            // have to explicitly type as HTMLFormElement as typescript can't infer type of the event.target
            form as HTMLFormElement,
          );
        }}
      >
        <CsrfFormField />
        {consents.map((consent) => (
          <ConsentCard
            key={consent.id}
            title={consent.name}
            titleLevel={2}
            description={consent.description || ''}
            id={consent.id}
            defaultChecked={!!consent.consented}
            noImage
          />
        ))}
        <div css={[controls, continueButtonWrapper]}>
          <Button cssOverrides={continueButton} type="submit">
            Continue to the Guardian
          </Button>
        </div>
      </form>
    </ConsentsLayout>
  );
};
