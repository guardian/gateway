import React from 'react';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { titlepiece, textSans } from '@guardian/src-foundations/typography';
import { css } from '@emotion/core';
import { brand, space, neutral } from '@guardian/src-foundations';
import { RadioGroup, Radio } from '@guardian/src-radio';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { CommunicationCard } from '../components/ConsentsCommunicationCard';
import CardJobImage from '@/client/assets/gu-jobs.png';
import { PAGES } from '../components/PageProgression';

const h3 = css`
  color: ${brand[400]};
  margin: ${space[12]}px 0 ${space[3]}px 0;
  ${titlepiece.small()};
  // Overrides
  font-size: 17px;
  &:nth-of-type(2) {
    margin-top: ${space[9]}px;
  }
`;

const p = css`
  margin: 0;
  ${textSans.medium()}
`;

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
  margin-top: ${space[6]}px;
`;

export const ConsentsCommunicationPage = () => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);

  return (
    <ConsentsLayout title="Guardian communication" current={PAGES[1]}>
      <h3 css={[h3, autoRow()]}>Guardian products, services & events </h3>
      <p css={[p, autoRow()]}>
        Stay informed and up to date with all that The Guardian has to offer.
        From time to time we can send you information about our latest products,
        services and events.
      </p>
      <div css={[communicationCardContainer, autoRow()]}>
        <CommunicationCard
          titleTop="News"
          titleBottom="& Offers"
          body="News and offers from The Guardian, The Observer and Guardian Weekly."
          value="news"
        />
        <CommunicationCard
          titleBottom="Jobs"
          body="Receive tips, Job Match recommendations, and advice from Guardian Jobs on taking your next career step."
          value="jobs"
          image={CardJobImage}
        />
        <CommunicationCard
          titleTop="Holidays"
          titleBottom="& Vacations"
          body="Ideas and inspiration for your next trip away, as well as the latest offers from Guardian Holidays in the UK and Guardian Vacations."
          value="holidays"
        />
        <CommunicationCard
          titleTop="Events"
          titleBottom="& Masterclass"
          body="Learn from leading minds at our Guardian live events, including discussions and debates, short courses and bespoke training."
          value="events"
        />
        <CommunicationCard
          titleBottom="Offers"
          body="Offers and competitions from The Guardian and other carefully selected and trusted partners that we think you might like."
          value="offers"
        />
      </div>
      <h3 css={[h3, autoRow()]}>Using your data for market research</h3>
      <p css={[p, autoRow()]}>
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
        <RadioGroup orientation="horizontal" name="binary">
          <Radio value="yes" label="Yes" defaultChecked={true} />
          <Radio value="no" label="No" />
        </RadioGroup>
      </fieldset>
    </ConsentsLayout>
  );
};
