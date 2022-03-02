import React from 'react';
import { css } from '@emotion/react';
import { from, headline, until } from '@guardian/source-foundations';
import { Button } from '@guardian/source-react-components';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { GeoLocation } from '@/shared/model/Geolocation';
import { Consent } from '@/shared/model/Consent';
import { ConsentCard } from '@/client/components/ConsentCard';
import { CONSENT_IMAGES } from '@/client/models/ConsentImages';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { onboardingFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import useClientState from '@/client/lib/hooks/useClientState';
import { ConsentsContent, controls } from '@/client/layouts/shared/Consents';
import { mainStyles } from '@/client/layouts/ConsentsLayout';
import { ConsentsBlueBackground } from '@/client/components/ConsentsBlueBackground';

const form = css`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
`;

const heading = css`
  ${headline.small({ fontWeight: 'bold' })}

  ${from.tablet} {
    font-size: 32px;
  }
`;

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

export const SignInSuccess = ({
  geolocation,
  consents,
}: SignInSuccessProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  const clientState = useClientState();
  const { pageData = {}, queryParams } = clientState;

  return (
    <>
      <Header geolocation={geolocation} />
      <main css={mainStyles}>
        <form
          css={[form, autoRow()]}
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
          <ConsentsContent>
            <h1 css={[heading, autoRow()]}>
              Get the latest offers sent to your inbox
            </h1>
            <div css={autoRow()}>
              {consents.map((consent) => (
                <ConsentCard
                  key={consent.id}
                  title={consent.name}
                  titleLevel={2}
                  description={consent.description}
                  id={consent.id}
                  defaultChecked={!!consent.consented}
                  imagePath={CONSENT_IMAGES[consent.id]}
                />
              ))}
            </div>
          </ConsentsContent>
          <ConsentsBlueBackground>
            <div css={[autoRow(), controls, continueButtonWrapper]}>
              <Button cssOverrides={continueButton} type="submit">
                Continue to the Guardian
              </Button>
            </div>
          </ConsentsBlueBackground>
        </form>
      </main>
      <Footer />
    </>
  );
};
