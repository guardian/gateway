import React, { FunctionComponent, useContext } from 'react';
import { css } from '@emotion/core';
import { space, palette, brand } from '@guardian/src-foundations';
import {
  getAutoRow,
  gridItem,
  gridItemColumnConsents,
  SpanDefinition,
} from '@/client/styles/Grid';
import { from } from '@guardian/src-foundations/mq';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { NavBar } from '@/client/components/NavBar';
import { GlobalError } from '@/client/components/GlobalError';
import {
  ConsentsHeader,
  mainBackground,
  ConsentsContent,
  ConsentsBlueBackground,
  controls,
  main,
} from '@/client/layouts/shared/Consents';
import { Footer } from '@/client/components/Footer';
import { headingWithMq, text } from '@/client/styles/Consents';
import { Link } from '@guardian/src-link';
import { Consents } from '@/shared/model/Consent';
import { getErrorLink } from '@/client/lib/ErrorLink';
import { GlobalSuccess } from '@/client/components/GlobalSuccess';
import { LinkButton } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { maxWidth } from '../styles/Shared';

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

const newslettersBox = css`
  flex: 1 0 auto;
  align-content: flex-start;
  padding-bottom: ${space[24]}px;
`;

const continueBoxFlex = css`
  flex: 0 0 auto;
`;

const header = css`
  ${maxWidth}
  margin: 0 auto;
  padding-right: 0;
`;

const headerContainer = css`
  background-color: ${brand[400]};
`;

const confirmationSpanDefinition: SpanDefinition = {
  TABLET: {
    start: 2,
    span: 9,
  },
  DESKTOP: {
    start: 2,
    span: 8,
  },
  WIDE: {
    start: 3,
    span: 10,
  },
};

export const ConsentsConfirmationPage = () => {
  const autoRow = getAutoRow(1, confirmationSpanDefinition);
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData = {}, globalMessage: { error, success } = {} } = clientState;

  const {
    consents = [],
    newsletters = [],
    returnUrl = 'https://www.theguardian.com',
  } = pageData;

  const profiling_optout = consents.find(
    (consent) => consent.id === Consents.PROFILING,
  ) || { consented: true };

  const market_research_optout = consents.find(
    (consent) => consent.id === Consents.MARKET_RESEARCH,
  ) || { consented: true };

  const productConsents = consents.filter(
    (c) => !c.id.includes('_optout') && c.consented,
  );

  const subscribedNewsletters = newsletters.filter((n) => n.subscribed);

  return (
    <>
      <div css={headerContainer}>
        <NavBar cssOverrides={header} />
        {error && <GlobalError error={error} link={getErrorLink(error)} left />}
        {success && <GlobalSuccess success={success} />}
      </div>
      <ConsentsHeader title="Your registration is complete" />
      <main css={[mainBackground, main]}>
        <ConsentsContent>
          <h2 css={[headingWithMq, autoRow()]}>Your selections</h2>
          <p css={[text, autoRow()]}>
            You can change these setting anytime by going to{' '}
            <Link href="https://manage.theguardian.com/email-prefs">
              My Preferences
            </Link>
            .
          </p>
          <div css={[reviewTableContainer, autoRow()]}>
            <ReviewTableRow title="Newsletters">
              {subscribedNewsletters.length ? (
                subscribedNewsletters.map((n) => (
                  <p key={n.id} css={text}>
                    {n.name}
                  </p>
                ))
              ) : (
                <p css={text}>N/A</p>
              )}
            </ReviewTableRow>
            <ReviewTableRow title="Products & services">
              {productConsents.length ? (
                productConsents.map((c) => (
                  <p key={c.id} css={text}>
                    {c.name}
                  </p>
                ))
              ) : (
                <p css={text}>N/A</p>
              )}
            </ReviewTableRow>
            <ReviewTableRow title="Marketing research">
              <p css={text}>
                {market_research_optout.consented ? 'No' : 'Yes'}
              </p>
            </ReviewTableRow>
            <ReviewTableRow title="Marketing analysis">
              <p css={text}>{profiling_optout.consented ? 'No' : 'Yes'}</p>
            </ReviewTableRow>
          </div>
        </ConsentsContent>
        <ConsentsBlueBackground cssOverrides={continueBoxFlex}>
          <div css={[gridItem(gridItemColumnConsents), controls]}>
            <LinkButton
              iconSide="right"
              nudgeIcon={true}
              icon={<SvgArrowRightStraight />}
              href={returnUrl}
            >
              Return to The Guardian
            </LinkButton>
          </div>
        </ConsentsBlueBackground>
        <ConsentsContent cssOverrides={newslettersBox}>
          <h2 css={[headingWithMq, autoRow()]}>Sign up to more newsletters</h2>
          <p css={[text, autoRow()]}>
            We have over 40 different emails that focus on a range of diverse
            topics - from politics and the latest tech to documentaries, sport
            and scientific breakthroughs. Sign up to more in{' '}
            <Link href="https://manage.theguardian.com/email-prefs">
              Guardian newsletters
            </Link>
            .
          </p>
        </ConsentsContent>
      </main>
      <Footer />
    </>
  );
};
