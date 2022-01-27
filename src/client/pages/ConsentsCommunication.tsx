import React from 'react';
import { css } from '@emotion/react';
import { from, space } from '@guardian/source-foundations';
import {
  getAutoRow,
  gridItemColumnConsents,
  consentsParagraphSpanDef,
} from '@/client/styles/Grid';
import { Consent } from '@/shared/model/Consent';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { heading, text, greyBorderTop } from '@/client/styles/Consents';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import {
  ConsentsContent,
  CONSENTS_MAIN_COLOR,
} from '@/client/layouts/shared/Consents';
import { CommunicationCard } from '@/client/components/CommunicationCard';
import { CONSENT_IMAGES } from '@/client/models/ConsentImages';

type ConsentsCommunicationProps = {
  consents: Consent[];
};

const communicationCardContainer = css`
  display: flex;
  flex-flow: row wrap;
  ${from.desktop} {
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

const p = css`
  margin-bottom: ${space[6]}px;
`;

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
        <h2 css={[heading, greyBorderTop, autoRow()]}>
          Thank you for registering
        </h2>
        <p css={[text, p, autoRow(consentsParagraphSpanDef)]}>
          Would you like to join our mailing list to stay informed and up to
          date with all that the Guardian has to offer?
        </p>
        <div css={[autoRow()]}>
          <div
            css={[
              communicationCardContainer,
              autoRow(communicationCardSpanDef),
            ]}
          >
            {consents.map((consent) => (
              <CommunicationCard
                key={consent.id}
                title={consent.name}
                body={consent.description}
                value={consent.id}
                checked={!!consent.consented}
                image={CONSENT_IMAGES[consent.id]}
              />
            ))}
          </div>
        </div>
      </ConsentsContent>
    </ConsentsLayout>
  );
};
