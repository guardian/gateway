import React, { FunctionComponent } from 'react';
import { css } from '@emotion/react';
import { from, space, success, neutral } from '@guardian/source-foundations';
import {
  getAutoRow,
  gridItem,
  gridItemColumnConsents,
  SpanDefinition,
} from '@/client/styles/Grid';
import { ConsentsContent } from '@/client/layouts/shared/Consents';
import { ConsentsSubHeader } from '@/client/components/ConsentsSubHeader';
import { ConsentsBlueBackground } from '@/client/components/ConsentsBlueBackground';
import { ConsentsHeader } from '@/client/components/ConsentsHeader';
import { Footer } from '@/client/components/Footer';
import { greyBorderTop, headingWithMq, text } from '@/client/styles/Consents';
import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import {
  ExternalLink,
  ExternalLinkButton,
} from '@/client/components/ExternalLink';
import { GeoLocation } from '@/shared/model/Geolocation';
import { SvgTickRound } from '@guardian/source-react-components';

type ConsentsConfirmationProps = {
  error?: string;
  success?: string;
  returnUrl: string;
  optedOutOfProfiling: boolean;
  productConsents: Consent[];
  subscribedNewsletters: NewsLetter[];
  geolocation?: GeoLocation;
};

const reviewTableRow = css`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: ${space[5]}px 0 0;

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

const reviewTableTextBold = css`
  ${text}
  font-weight: bold;
  padding-bottom: ${space[2]}px;
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

const continueBoxFlex = css`
  flex: 0 0 auto;
`;

const confirmationSpanDefinition: SpanDefinition = {
  TABLET: {
    start: 1,
    span: 9,
  },
  DESKTOP: {
    start: 2,
    span: 8,
  },
  LEFT_COL: {
    start: 2,
    span: 8,
  },
  WIDE: {
    start: 3,
    span: 10,
  },
};

const sectionStyles = css`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  padding-bottom: ${space[24]}px;
`;

const iconStyles = css`
  svg {
    display: block;
    fill: ${success[400]};
    height: 22px;
    width: 22px;
  }
`;

const consentStyles = css`
  display: flex;
  border-top: 1px solid ${neutral[86]};
  padding: ${space[2]}px 0;

  &:last-child {
    border-bottom: 1px solid ${neutral[86]};
  }
`;

const itemText = css`
  margin-left: ${space[2]}px;
`;

const textPadding = css`
  ${text}
  padding-bottom: ${space[4]}px;
`;

export const ConsentsConfirmation = ({
  error,
  success,
  returnUrl,
  productConsents,
  subscribedNewsletters,
  geolocation,
}: ConsentsConfirmationProps) => {
  const autoRow = getAutoRow(1, confirmationSpanDefinition);
  return (
    <>
      <ConsentsHeader
        error={error}
        success={success}
        geolocation={geolocation}
      />
      <main>
        <ConsentsSubHeader
          autoRow={autoRow}
          title="Your registration is complete"
        />
        <section css={[sectionStyles]}>
          <ConsentsContent>
            <h2 css={[headingWithMq, autoRow(), greyBorderTop]}>
              Thank you for completing your registration
            </h2>
            <p css={[textPadding, autoRow()]}>
              You now have an account with the Guardian and you can manage your
              preferences and options at anytime under&nbsp;
              <ExternalLink
                href="https://manage.theguardian.com/email-prefs"
                subdued={true}
              >
                Emails &amp; marketing
              </ExternalLink>
              .
            </p>
            <div css={[autoRow()]}>
              {subscribedNewsletters.length ? (
                <ReviewTableRow title="Newsletters">
                  {subscribedNewsletters.map((n) => (
                    <div key={n.id} css={consentStyles}>
                      <span css={iconStyles}>
                        <SvgTickRound />
                      </span>
                      <p css={[text, itemText]}>{n.name}</p>
                    </div>
                  ))}
                </ReviewTableRow>
              ) : null}
              {productConsents.length ? (
                <ReviewTableRow title="Products &amp; services">
                  {productConsents.map((c) => (
                    <div key={c.id} css={consentStyles}>
                      <span css={iconStyles}>
                        <SvgTickRound />
                      </span>
                      <p css={[text, itemText]}>{c.name}</p>
                    </div>
                  ))}
                </ReviewTableRow>
              ) : null}
            </div>
            <h2 css={[headingWithMq, autoRow(), greyBorderTop]}>
              Guardian newsletters
            </h2>
            <p css={[text, autoRow()]}>Didn’t find anything you like?</p>
            <p css={[text, autoRow()]}>
              We have over&nbsp;
              <ExternalLink
                href="https://manage.theguardian.com/email-prefs"
                subdued={true}
              >
                40 different newsletters
              </ExternalLink>
              &nbsp;that focus on a range of diverse topics - from politics to
              the latest tech documentaries, sport and scientific breakthroughs.
            </p>
          </ConsentsContent>
          <ConsentsBlueBackground cssOverrides={continueBoxFlex}>
            <div css={[gridItem(gridItemColumnConsents)]}>
              <ExternalLinkButton iconSide="right" href={returnUrl}>
                Return to the Guardian
              </ExternalLinkButton>
            </div>
          </ConsentsBlueBackground>
        </section>
      </main>
      <Footer />
    </>
  );
};
