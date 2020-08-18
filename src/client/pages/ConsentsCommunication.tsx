import React, { FunctionComponent } from 'react';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { titlepiece, textSans } from '@guardian/src-foundations/typography';
import { css } from '@emotion/core';
import { brand, space, neutral, palette } from '@guardian/src-foundations';
import { RadioGroup, Radio } from '@guardian/src-radio';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { CheckboxGroup, Checkbox } from '@guardian/src-checkbox';
import { from } from '@guardian/src-foundations/mq';

interface CommunicationCardProps {
  titleTop?: string;
  titleBottom: string;
  body: string;
  value: string;
}

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
  padding: ${space[9]}px 0;
`;

const communicationCard = css`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid white;
  margin: ${space[2]}px 0px;

  ${from.tablet} {
    margin: ${space[3]}px 0px;
    width: 50%;
  }

  ${from.wide} {
    width: calc(100% / 3);
  }
`;

const communicationCardHeadingContainer = css`
  background-color: ${palette.background.ctaPrimary};
  height: 45%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: ${space[24]}px ${space[3]}px ${space[2]}px ${space[3]}px;
`;

const communicationCardHeadingText = css`
  color: ${palette.text.ctaPrimary};
  margin: 0;
  ${titlepiece.small()};
  font-size: 27px;
  line-height: 29px;
`;

const communicationCardBodyContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 40%;
  background-color: #eaeef5;
  padding: ${space[2]}px ${space[3]}px;
`;

const communicationCardBodyText = css`
  color: ${palette.text.primary};
  margin: 0;
  width: 70%;
  ${textSans.small({ lineHeight: 'tight' })};
`;

const communicationCardForm = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 15%;
  background-color: #eaeef5;
  padding: ${space[2]}px ${space[3]}px;
`;

const CommunicationCard: FunctionComponent<CommunicationCardProps> = ({
  titleTop,
  titleBottom,
  body,
  value,
}) => {
  return (
    <div css={communicationCard}>
      <div css={communicationCardHeadingContainer}>
        <h3 css={communicationCardHeadingText}>
          {titleTop}
          <br />
          {titleBottom}
        </h3>
      </div>
      <div css={communicationCardBodyContainer}>
        <p css={communicationCardBodyText}>{body}</p>
      </div>
      <form css={communicationCardForm}>
        <CheckboxGroup name="emails">
          <Checkbox value={value} label="Sign Up" checked={false} />
        </CheckboxGroup>
      </form>
    </div>
  );
};

export const ConsentsCommunicationPage = () => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);

  return (
    <ConsentsLayout title="Guardian communication">
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
