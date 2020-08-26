import React, { FunctionComponent } from 'react';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import {
  titlepiece,
  textSans,
  headline,
} from '@guardian/src-foundations/typography';
import { css } from '@emotion/core';
import { brand, space, palette } from '@guardian/src-foundations';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { from } from '@guardian/src-foundations/mq';
import { SvgRoundel } from '@guardian/src-brand';
import { GuardianRoundel } from '../components/GuardianRoundel';

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

const pBold = css`
  margin: 0;
  ${textSans.medium({ fontWeight: 'bold' })}
  padding-bottom: ${space[2]}px;
  
  ${from.tablet} {
    padding-bottom: 0;
  }
`;

const homepageCardContainer = css`
  display: flex;
  flex-flow: row wrap;
`;

const homepageCard = css`
  display: flex;
  flex-direction: row;
  margin: ${space[2]}px 0px;
  background-color: ${palette.background.ctaPrimary};
  flex: 1 1 auto;
  text-decoration: none;
`;

const homepageCardRoundel = css`
  display: flex;
  & svg {
    width: 42px;
    height: 42px;
    fill: white;
  }
`;

const homepageCardLine = css`
  position: relative;
  height: 80%;
  top: 10%;
  border: 1px solid #a7b4ca;
  /* transform: rotate(90deg); */
`;

const homepageCardHeaderContainer = css`
  padding: ${space[3]}px;
`;

const homepageCardTextContainer = css`
  padding: ${space[3]}px;
`;

const homepageCardText = css`
  ${headline.xxxsmall({ fontWeight: 'bold' })};
  margin: 0;
  color: ${palette.text.ctaPrimary};
`;

const reviewTableContainer = css`
  display: flex;
  flex-flow: column;
  margin-top: ${space[6]}px;
  border: 1px solid ${palette.border.secondary};
`;

const reviewTableRow = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-bottom: 1px solid ${palette.border.secondary};
  padding: ${space[5]}px;

  ${from.tablet} {
    flex-direction: row;
  }

  &:last-child {
    border: 0;
  }
`;

const reviewTableCell = css`
  flex: 1 1 auto;

  ${from.tablet} {
    flex: 1 1 0px;
  }
`;

const ReviewTableRow: FunctionComponent<{ title: string }> = ({
  title,
  children,
}) => (
  <div css={reviewTableRow}>
    <div css={reviewTableCell}>
      <p css={pBold}>{title}:</p>
    </div>
    <div css={reviewTableCell}>{children}</div>
  </div>
);

export const ConsentsConfirmationPage = () => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);

  return (
    <ConsentsLayout
      title="Your registration is complete"
      current={CONSENTS_PAGES.REVIEW}
    >
      <h3 css={[h3, autoRow()]}>Your selections</h3>
      <p css={[p, autoRow()]}>
        You can change these setting anytime by going to My Preferences.
      </p>
      <div css={[reviewTableContainer, autoRow()]}>
        <ReviewTableRow title="Marketing analysis">
          <p css={p}>Opted in</p>
        </ReviewTableRow>
        <ReviewTableRow title="Products & services">
          <p css={p}>Supporting the Guardian</p>
          <p css={p}>Jobs</p>
          <p css={p}>Events & Masterclasses</p>
        </ReviewTableRow>
        <ReviewTableRow title="Marketing research">
          <p css={p}>Opted in</p>
        </ReviewTableRow>
        <ReviewTableRow title="Newsletters">
          <p css={p}>The Guardian Today</p>
          <p css={p}>The Long Read</p>
          <p css={p}>Global Dispatch</p>
        </ReviewTableRow>
      </div>
      <div css={autoRow()}>
        <h3 css={h3}>Get back to where you left off</h3>
        <div css={homepageCardContainer}>
          <a css={homepageCard} href="https://theguardian.com">
            <div css={homepageCardHeaderContainer}>
              <div css={homepageCardRoundel}>
                <SvgRoundel />
              </div>
            </div>
            <span css={homepageCardLine}></span>
            <div css={homepageCardTextContainer}>
              <h4 css={homepageCardText}>Return to The Guardian homepage</h4>
            </div>
          </a>
        </div>
      </div>
      <h3 css={[h3, autoRow()]}>Sign up to more newsletters</h3>
      <p css={[p, autoRow()]}>
        We have over 40 different emails that focus on a range of diverse topics
        - from politics and the latest tech to documentaries, sport and
        scientific breakthroughs. Sign up to more in Guardian newsletters.
      </p>
    </ConsentsLayout>
  );
};
