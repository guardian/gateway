import React, { FunctionComponent, useContext } from 'react';
import { headline } from '@guardian/src-foundations/typography';
import { css } from '@emotion/core';
import { space, palette } from '@guardian/src-foundations';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { from } from '@guardian/src-foundations/mq';
import { SvgRoundel } from '@guardian/src-brand';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '../components/GlobalState';
import { Header } from '../components/Header';
import { GlobalError } from '../components/GlobalError';
import {
  ConsentsHeader,
  mainBackground,
  ieFlexFix,
  ConsentsContent,
  ConsentsBlueBackground,
  ConsentsProgression,
} from '../layouts/shared/Consents';
import { Footer } from '../components/Footer';
import { headingWithMq, text } from '../styles/Consents';

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

  ${from.tablet} {
    flex: 0 0 auto;
    flex-direction: column;
    width: 33.33%;
    height: 240px;
  }
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
  border-top: 1px solid #a7b4ca;
  border-right: 1px solid #a7b4ca;

  ${from.tablet} {
    top: 0;
    height: auto;
    left: 5%;
    width: 90%;
  }
`;

const homepageCardHeaderContainer = css`
  padding: ${space[3]}px;

  ${from.tablet} {
    display: flex;
    justify-content: flex-end;
    align-items: start;
    flex: 1 1 auto;
  }
`;

const homepageCardTextContainer = css`
  padding: ${space[3]}px;
  flex: 2 1 auto;
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

export const reviewTableTextBold = css`
  ${text}
  font-weight: bold;
  padding-bottom: ${space[2]}px;

  ${from.tablet} {
    padding-bottom: 0;
  }
`;

const ReviewTableRow: FunctionComponent<{ title: string }> = ({
  title,
  children,
}) => (
  <div css={reviewTableRow}>
    <div css={reviewTableCell}>
      <p css={reviewTableTextBold}>{title}:</p>
    </div>
    <div css={reviewTableCell}>{children}</div>
  </div>
);

const returnBox = css`
  padding: ${space[6]}px 0 ${space[12]}px;

  ${from.desktop} {
    padding: ${space[12]}px 0;
  }
`;

export const ConsentsConfirmationPage = () => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { error } = globalState;

  return (
    <>
      <Header />
      {error && <GlobalError error={error} />}
      <ConsentsHeader title="Your registration is complete" />
      <main css={[mainBackground, ieFlexFix]}>
        <ConsentsContent>
          <ConsentsProgression current={CONSENTS_PAGES.REVIEW} />
          <h3 css={[headingWithMq, autoRow()]}>Your selections</h3>
          <p css={[text, autoRow()]}>
            You can change these setting anytime by going to My Preferences.
          </p>
          <div css={[reviewTableContainer, autoRow()]}>
            <ReviewTableRow title="Marketing analysis">
              <p css={text}>Opted in</p>
            </ReviewTableRow>
            <ReviewTableRow title="Products & services">
              <p css={text}>Supporting the Guardian</p>
              <p css={text}>Jobs</p>
              <p css={text}>Events & Masterclasses</p>
            </ReviewTableRow>
            <ReviewTableRow title="Marketing research">
              <p css={text}>Opted in</p>
            </ReviewTableRow>
            <ReviewTableRow title="Newsletters">
              <p css={text}>The Guardian Today</p>
              <p css={text}>The Long Read</p>
              <p css={text}>Global Dispatch</p>
            </ReviewTableRow>
          </div>
        </ConsentsContent>
        <ConsentsBlueBackground>
          <div css={[returnBox, autoRow()]}>
            <h3 css={headingWithMq}>Get back to where you left off</h3>
            <div css={homepageCardContainer}>
              <a css={homepageCard} href="https://theguardian.com">
                <div css={homepageCardHeaderContainer}>
                  <div css={homepageCardRoundel}>
                    <SvgRoundel />
                  </div>
                </div>
                <span css={homepageCardLine}></span>
                <div css={homepageCardTextContainer}>
                  <h4 css={homepageCardText}>
                    Return to The Guardian homepage
                  </h4>
                </div>
              </a>
            </div>
          </div>
        </ConsentsBlueBackground>
        <ConsentsContent>
          <h3 css={[headingWithMq, autoRow()]}>Sign up to more newsletters</h3>
          <p css={[text, autoRow()]}>
            We have over 40 different emails that focus on a range of diverse
            topics - from politics and the latest tech to documentaries, sport
            and scientific breakthroughs. Sign up to more in Guardian
            newsletters.
          </p>
        </ConsentsContent>
      </main>
      <Footer />
    </>
  );
};
