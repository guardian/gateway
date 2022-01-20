import React, { useContext } from 'react';
import { Checkbox } from '@guardian/source-react-components';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { GeoLocation } from '@/shared/model/Geolocation';
import { Consent } from '@/shared/model/Consent';
import { QueryParams } from '@/shared/model/QueryParams';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { onboardingFormSubmitOphanTracking } from '@/client/lib/consentsTracking';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';

export type SignInSuccessProps = {
  queryParams: QueryParams;
  geolocation?: GeoLocation;
  consents: Consent[];
};

export const SignInSuccess = ({ consents }: SignInSuccessProps) => {
  const { id, name, description, consented } = consents[0];
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, queryParams } = clientState;
  const { page = '', geolocation } = pageData;

  return (
    <>
      <Header geolocation={geolocation} />
      <form
        action={buildUrlWithQueryParams('/signin/success', {}, queryParams)}
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
        <CsrfFormField />
        <h1>{name}</h1>
        <p>{description}</p>
        <Checkbox
          name={id}
          value={id}
          label="Yes, sign me up"
          defaultChecked={!!consented}
        />
        <button>Continue to The Guardian</button>
      </form>
      <Footer />
    </>
  );
};
