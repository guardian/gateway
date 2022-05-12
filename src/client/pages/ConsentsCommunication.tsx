import React from 'react';
import { css } from '@emotion/react';
import { space } from '@guardian/source-foundations';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { Consent } from '@/shared/model/Consent';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { heading, text, greyBorderTop } from '@/client/styles/Consents';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { ConsentCard } from '@/client/components/ConsentCard';
import { ConsentsForm } from '@/client/components/ConsentsForm';
import { ConsentsNavigation } from '@/client/components/ConsentsNavigation';

type ConsentsCommunicationProps = {
  consents: Consent[];
};

const p = css`
  margin-bottom: ${space[6]}px;
`;

export const ConsentsCommunication = ({
  consents,
}: ConsentsCommunicationProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);

  return (
    <ConsentsLayout title="Stay in touch" current={CONSENTS_PAGES.CONTACT}>
      <h2 css={[heading, greyBorderTop, autoRow()]}>
        Thank you for registering
      </h2>
      <p css={[text, p, autoRow()]}>
        Would you like to join our mailing list to stay informed and up to date
        with all that the Guardian has to offer?
      </p>
      <ConsentsForm cssOverrides={autoRow()}>
        {consents.map((consent) => (
          <ConsentCard
            key={consent.id}
            title={consent.name}
            titleLevel={3}
            description={consent.description || ''}
            id={consent.id}
            defaultChecked={!!consent.consented}
            noImage
          />
        ))}
        <ConsentsNavigation />
      </ConsentsForm>
    </ConsentsLayout>
  );
};
