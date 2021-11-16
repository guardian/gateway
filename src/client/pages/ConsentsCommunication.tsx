import React from 'react';
import { textSans } from '@guardian/src-foundations/typography';
import { css } from '@emotion/react';
import { space, neutral } from '@guardian/src-foundations';
import {
  getAutoRow,
  gridItemColumnConsents,
  consentsParagraphSpanDef,
} from '@/client/styles/Grid';
import { CommunicationCard } from '@/client/components/CommunicationCard';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { heading, text } from '@/client/styles/Consents';
import { Consent } from '@/shared/model/Consent';
import { Checkbox, CheckboxGroup } from '@guardian/src-checkbox';
import { from } from '@guardian/src-foundations/mq';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import {
  ConsentsContent,
  CONSENTS_MAIN_COLOR,
} from '@/client/layouts/shared/Consents';

type ConsentsCommunicationProps = {
  marketResearchOptout?: Consent;
  consentsWithoutOptout: Consent[];
};

const fieldset = css`
  border: 0;
  padding: 0;
  margin: 14px 0 ${space[1]}px 0;
  ${textSans.medium()}
`;

const checkboxLabel = css`
  color: ${neutral[46]};
`;

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
  marketResearchOptout,
  consentsWithoutOptout,
}: ConsentsCommunicationProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);

  const label = (
    <span css={checkboxLabel}>{marketResearchOptout?.description}</span>
  );

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
          {consentsWithoutOptout.map((consent) => (
            <CommunicationCard
              key={consent.id}
              title={consent.name}
              body={consent.description}
              value={consent.id}
              checked={!!consent.consented}
            />
          ))}
        </div>
        {marketResearchOptout && (
          <>
            <h2 css={[heading, autoRow()]}>
              Using your data for market research
            </h2>
            <p css={[text, autoRow()]}>
              From time to time we may contact you for market research purposes
              inviting you to complete a survey, or take part in a group
              discussion. Normally, this invitation would be sent via email, but
              we may also contact you by phone.
            </p>
            <fieldset css={[fieldset, autoRow()]}>
              <CheckboxGroup name={marketResearchOptout.id}>
                <Checkbox
                  value="consent-option"
                  label={label}
                  defaultChecked={marketResearchOptout.consented}
                />
              </CheckboxGroup>
            </fieldset>
          </>
        )}
      </ConsentsContent>
    </ConsentsLayout>
  );
};
