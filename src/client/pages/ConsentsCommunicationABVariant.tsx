import React, { useContext } from 'react';
import { textSans } from '@guardian/src-foundations/typography';
import { css } from '@emotion/react';
import { space, neutral, palette } from '@guardian/src-foundations';
import {
  getAutoRow,
  gridItemColumnConsents,
  consentsParagraphSpanDef,
  manualRow,
} from '@/client/styles/Grid';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { heading, text } from '@/client/styles/Consents';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { Consents } from '@/shared/model/Consent';
import { Checkbox, CheckboxGroup } from '@guardian/src-checkbox';
import { from } from '@guardian/src-foundations/mq';
import { CommunicationCardABVariant } from '../components/ConsentsCommunicationCardABVariant';
import { ConsentsLayoutABVariant } from '../layouts/ConsentsLayoutABVariant';
import { EnvelopeImage } from '../components/EnvelopeImage';
import { ConsentsContent } from '../layouts/shared/Consents';

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
  ${from.tablet} {
    margin-bottom: 0;
    -ms-grid-row: 1;
    grid-row: 1;
  }
  ${from.desktop} {
    margin: ${space[5]}px 0 32px;
  }
  margin-bottom: 32px;
`;

const pagePadding = css`
  padding-left: ${space[3]}px;
  padding-right: ${space[3]}px;
  position: relative;
  ${from.tablet} {
    padding-left: 0;
    padding-right: 0;
  }
`;

const envelope = css`
  display: block;
  margin: 0 auto;
  width: 100%;
  max-width: 234px;
  ${from.tablet} {
    max-width: none;
    position: absolute;
    bottom: -24px;
    margin: 0;
    width: 220px;
    height: 207px;
  }
  ${from.desktop} {
    bottom: -30px;
    width: 280px;
    height: 262px;
  }
  ${from.wide} {
    width: 360px;
    height: 340px;
    bottom: -40px;
  }
`;

const envelopeContainer = css`
  display: block;
  background-color: ${palette.background.ctaPrimary};
  padding: 40px 0 ${space[6]}px 0;
  ${from.tablet} {
    padding: 0;
    overflow: hidden;
    position: relative;
    grid-row: 1;
  }
`;

const aBSpanDef = {
  ...consentsParagraphSpanDef,
  TABLET: {
    start: 1,
    span: 7,
  },
  DESKTOP: {
    start: 2,
    span: 6,
  },
  WIDE: {
    start: 3,
    span: 7,
  },
};

const controlSpanDef = {
  ...aBSpanDef,
  TABLET: {
    start: 1,
    span: 12,
  },
  DESKTOP: {
    start: 2,
    span: 9,
  },
  WIDE: {
    start: 3,
    span: 9,
  },
};

const envelopeSpanDef = {
  MOBILE: {
    start: 2,
    span: 2,
  },
  TABLET: {
    start: 9,
    span: 4,
  },
  DESKTOP: {
    start: 9,
    span: 4,
  },
  WIDE: {
    start: 11,
    span: 5,
  },
};

const consentsContent = css`
  background: none;
  padding-top: 0;
  padding-bottom: 0;
  background-color: ${palette.background.ctaPrimary};
`;

const marketingContent = css`
  padding-left: 0;
  padding-right: 0;
  padding-top: ${space[9]}px;
`;

const marketingContainer = css`
  padding: 0;
  margin: 0;
  width: 100%;
  background-color: white;
`;

export const ConsentsCommunicationPageABVariant = () => {
  const autoRow = getAutoRow(0, gridItemColumnConsents);

  const clientState = useContext<ClientState>(ClientStateContext);

  const { pageData = {} } = clientState;
  const { consents = [] } = pageData;

  const market_research_optout = consents.find(
    (consent) => consent.id === Consents.MARKET_RESEARCH,
  );

  const consentsWithoutOptout = consents.filter(
    (consent) => !consent.id.includes('_optout'),
  );

  const label = (
    <span css={checkboxLabel}>{market_research_optout?.description}</span>
  );

  return (
    <ConsentsLayoutABVariant
      current={CONSENTS_PAGES.CONTACT}
      title="Welcome, thank you for registering"
    >
      {market_research_optout && (
        <>
          <ConsentsContent cssOverrides={consentsContent}>
            <div css={[envelopeContainer, manualRow(1, envelopeSpanDef)]}>
              <EnvelopeImage cssOverrides={envelope} />
            </div>
            <div css={[communicationCardContainer, manualRow(2, aBSpanDef)]}>
              {consentsWithoutOptout.map((consent) => (
                <CommunicationCardABVariant
                  key={consent.id}
                  title={consent.name}
                  body={consent.description}
                  value={consent.id}
                  checked={!!consent.consented}
                />
              ))}
            </div>
          </ConsentsContent>
          <div css={marketingContainer}>
            <ConsentsContent cssOverrides={marketingContent}>
              <h2 css={[heading, autoRow(aBSpanDef), pagePadding]}>
                Using your data for market research
              </h2>
              <p css={[text, autoRow(aBSpanDef), pagePadding]}>
                From time to time we may contact you for market research
                purposes inviting you to complete a survey, or take part in a
                group discussion. Normally, this invitation would be sent via
                email, but we may also contact you by phone.
              </p>
              <fieldset
                css={[
                  fieldset,
                  autoRow(controlSpanDef),
                  pagePadding,
                  css`
                    margin-top: 30px;
                  `,
                ]}
              >
                <CheckboxGroup name={market_research_optout.id}>
                  <Checkbox
                    value="consent-option"
                    label={label}
                    defaultChecked={market_research_optout.consented}
                  />
                </CheckboxGroup>
              </fieldset>
            </ConsentsContent>
          </div>
        </>
      )}
    </ConsentsLayoutABVariant>
  );
};
