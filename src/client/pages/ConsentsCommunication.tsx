import React from 'react';
import { css } from '@emotion/react';
import { from, space } from '@guardian/source-foundations';
import {
  getAutoRow,
  gridItemColumnConsents,
  consentsParagraphSpanDef,
} from '@/client/styles/Grid';
import { CommunicationCard } from '@/client/components/CommunicationCard';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { heading, text } from '@/client/styles/Consents';
import { Consent } from '@/shared/model/Consent';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import {
  ConsentsContent,
  CONSENTS_MAIN_COLOR,
} from '@/client/layouts/shared/Consents';

type ConsentsCommunicationProps = {
  consents: Consent[];
};

const communicationCardContainer = css`
  display: flex;
  flex-flow: row wrap;
  margin: ${space[6]}px 0 ${space[2]}px;
  ${from.desktop} {
    margin: ${space[5]}px 0 32px;
    grid-column: 2 / span 9;
  }
  ${from.wide} {
    grid-column: 3 / span 9;
  }
`;

const communicationCardSpanDef = {
  ...gridItemColumnConsents,
  DESKTOP: {
    start: 2,
    span: 9,
  },
  WIDE: {
    start: 3,
    span: 9,
  },
};

export const ConsentsCommunication = ({
  consents,
}: ConsentsCommunicationProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);

  return (
    <ConsentsLayout
      title="Stay in touch"
      current={CONSENTS_PAGES.CONTACT}
      bgColor={CONSENTS_MAIN_COLOR}
    >
      <ConsentsContent>
        <h2 css={[heading, autoRow()]}>Thank you for registering</h2>
        <p css={[text, autoRow(consentsParagraphSpanDef)]}>
          Would you like to join our mailing list to stay informed and up to
          date with all that the Guardian has to offer?
        </p>
        <div
          css={[communicationCardContainer, autoRow(communicationCardSpanDef)]}
        >
          {consents.map((consent) => (
            <CommunicationCard
              key={consent.id}
              title={consent.name}
              body={consent.description}
              value={consent.id}
              checked={!!consent.consented}
            />
          ))}
        </div>
      </ConsentsContent>
    </ConsentsLayout>
  );
};
