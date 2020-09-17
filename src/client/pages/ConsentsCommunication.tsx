import React, { useContext } from 'react';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { textSans } from '@guardian/src-foundations/typography';
import { css } from '@emotion/core';
import { space, neutral } from '@guardian/src-foundations';
import { RadioGroup, Radio } from '@guardian/src-radio';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { CommunicationCard } from '@/client/components/ConsentsCommunicationCard';
import CardJobImage from '@/client/assets/gu-jobs.png';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { heading, text } from '@/client/styles/Consents';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { Consents } from '@/shared/model/Consent';

const fieldset = css`
  border: 0;
  padding: 0;
  margin: ${space[6]}px 0 0 0;
  ${textSans.medium()}
`;

const legend = css`
  color: ${neutral[46]};
  margin: 0 0 ${space[1]}px 0;
  padding: 0;
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
  ) || { consented: true };

  const supporter = consents.find(
    (consent) => consent.id === Consents.SUPPORTER,
  ) || {
    consented: false,
  };

  const jobs = consents.find((consent) => consent.id === Consents.JOBS) || {
    consented: false,
  };

  const holidays = consents.find(
    (consent) => consent.id === Consents.HOLIDAYS,
  ) || {
    consented: false,
  };

  const events = consents.find((consent) => consent.id === Consents.EVENTS) || {
    consented: false,
  };

  const offers = consents.find((consent) => consent.id === Consents.OFFERS) || {
    consented: false,
  };

  return (
    <ConsentsLayout
      title="Guardian communication"
      current={CONSENTS_PAGES.CONTACT}
    >
      <h3 css={[heading, autoRow()]}>Guardian products, services & events</h3>
      <p css={[text, autoRow()]}>
        Stay informed and up to date with all that The Guardian has to offer.
        From time to time we can send you information about our latest products,
        services and events.
      </p>
      <div css={[communicationCardContainer, autoRow()]}>
        <CommunicationCard
          titleTop="News"
          titleBottom="& Offers"
          body="News and offers from The Guardian, The Observer and Guardian Weekly."
          value={Consents.SUPPORTER}
          checked={supporter.consented}
        />
        <CommunicationCard
          titleBottom="Jobs"
          body="Receive tips, Job Match recommendations, and advice from Guardian Jobs on taking your next career step."
          image={CardJobImage}
          value={Consents.JOBS}
          checked={jobs.consented}
        />
        <CommunicationCard
          titleTop="Holidays"
          titleBottom="& Vacations"
          body="Ideas and inspiration for your next trip away, as well as the latest offers from Guardian Holidays in the UK and Guardian Vacations."
          value={Consents.HOLIDAYS}
          checked={holidays.consented}
        />
        <CommunicationCard
          titleTop="Events"
          titleBottom="& Masterclass"
          body="Learn from leading minds at our Guardian live events, including discussions and debates, short courses and bespoke training."
          value={Consents.EVENTS}
          checked={events.consented}
        />
        <CommunicationCard
          titleBottom="Offers"
          body="Offers and competitions from The Guardian and other carefully selected and trusted partners that we think you might like."
          value={Consents.OFFERS}
          checked={offers.consented}
        />
      </div>
      <h3 css={[heading, autoRow()]}>Using your data for market research</h3>
      <p css={[text, autoRow()]}>
        From time to time we may contact you for market research purposes
        inviting you to complete a survey, or take part in a group discussion.
        Normally, this invitation would be sent via email, but we may also
        contact you by phone.
      </p>
      <fieldset css={[fieldset, autoRow()]}>
        <legend css={legend}>
          I am happy for The Guardian to use my personal data for market
          research purposes
        </legend>
        <RadioGroup orientation="horizontal" name={Consents.MARKET_RESEARCH}>
          <Radio
            value="false"
            label="Yes"
            checked={!market_research_optout.consented}
          />
          <Radio
            value="true"
            label="No"
            checked={market_research_optout.consented}
          />
        </RadioGroup>
      </fieldset>
    </ConsentsLayout>
  );
};
