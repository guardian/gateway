import React, { useContext } from 'react';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { textSans } from '@guardian/src-foundations/typography';
import { css } from '@emotion/core';
import { space, neutral } from '@guardian/src-foundations';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { CommunicationCard } from '@/client/components/ConsentsCommunicationCard';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { heading, text } from '@/client/styles/Consents';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { Consents } from '@/shared/model/Consent';
import { Checkbox, CheckboxGroup } from '@guardian/src-checkbox';

const fieldset = css`
  border: 0;
  padding: 0;
  margin: ${space[6]}px 0 0 0;
  ${textSans.medium()}
`;

const checkboxLabel = css`
  color: ${neutral[46]};
`;

const communicationCardContainer = css`
  display: flex;
  flex-flow: row wrap;
  margin: ${space[6]}px 0;
`;

export const ConsentsCommunicationPage = () => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);

  const globalState = useContext<GlobalState>(GlobalStateContext);

  const { pageData = {} } = globalState;
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
    <ConsentsLayout title="Stay in touch" current={CONSENTS_PAGES.CONTACT}>
      {market_research_optout && (
        <>
          <h3 css={[heading, autoRow()]}>
            Guardian products, services & events
          </h3>
          <p css={[text, autoRow()]}>
            Stay informed and up to date with all that The Guardian has to
            offer. From time to time we can send you information about our
            latest products, services and events.
          </p>
          <div css={[communicationCardContainer, autoRow()]}>
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
          <h3 css={[heading, autoRow()]}>
            Using your data for market research
          </h3>
          <p css={[text, autoRow()]}>
            From time to time we may contact you for market research purposes
            inviting you to complete a survey, or take part in a group
            discussion. Normally, this invitation would be sent via email, but
            we may also contact you by phone.
          </p>
          <fieldset css={[fieldset, autoRow()]}>
            <CheckboxGroup name={market_research_optout.id}>
              <Checkbox
                value="consent-option"
                label={label}
                defaultChecked={market_research_optout.consented}
              />
            </CheckboxGroup>
          </fieldset>
        </>
      )}
    </ConsentsLayout>
  );
};
