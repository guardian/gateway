import React, { FunctionComponent } from 'react';
import { css } from '@emotion/react';
import {
  space,
  remSpace,
  success,
  neutral,
  until,
  textSans,
} from '@guardian/source-foundations';

import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import {
  greyBorderTop,
  heading,
  text,
  textBold,
  controls,
  subText,
} from '@/client/styles/Consents';
import { Consent } from '@/shared/model/Consent';
import { NewsLetter } from '@/shared/model/Newsletter';
import {
  ExternalLink,
  ExternalLinkButton,
} from '@/client/components/ExternalLink';
import { GeoLocation } from '@/shared/model/Geolocation';
import { SvgTickRound } from '@guardian/source-react-components';
import locations from '@/shared/lib/locations';

type ConsentsConfirmationProps = {
  error?: string;
  success?: string;
  returnUrl: string;
  optedIntoProfiling: boolean;
  optedIntoPersonalisedAdvertising: boolean;
  shouldPersonalisedAdvertisingRender: boolean;
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

const reviewTableTextBold = css`
  ${textBold}
  padding-bottom: ${space[2]}px;
`;

const ReviewTableRow: FunctionComponent<{ title: string }> = ({
  title,
  children,
}) => (
  <div css={reviewTableRow}>
    <p css={reviewTableTextBold}>{title}</p>
    {children}
  </div>
);

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

const noTopBorder = css`
  border-top: 0;
`;

const itemText = css`
  margin-left: ${space[2]}px;
`;

const paddingTop = css`
  padding-top: ${space[4]}px;
`;

const marginTop = css`
  margin-top: ${space[4]}px;
`;

const returnButton = css`
  ${until.tablet} {
    width: 100%;
    justify-content: center;
  }
`;

const marketingText = css`
  ${subText}
  p {
    color: ${neutral[20]};
  }
  a,
  p {
    ${textSans.small()}
    line-height: ${remSpace[5]};
  }
`;

// TODO Fix consents confirmation Data consent display

export const ConsentsConfirmation = ({
  returnUrl,
  productConsents,
  optedIntoProfiling,
  optedIntoPersonalisedAdvertising,
  shouldPersonalisedAdvertisingRender,
  subscribedNewsletters,
}: ConsentsConfirmationProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  const anyConsents =
    optedIntoProfiling ||
    optedIntoPersonalisedAdvertising ||
    !!productConsents.length ||
    !!subscribedNewsletters.length;

  console.log('anyconsents', anyConsents);

  return (
    <ConsentsLayout title="Your registration is complete">
      <h2 css={[heading, autoRow(), greyBorderTop]}>
        Thank you for completing your registration
      </h2>
      {anyConsents ? (
        <p css={[text, autoRow()]}>
          Please find below a summary of your settings.
        </p>
      ) : (
        <p css={[text, autoRow()]}>
          You now have an account with the Guardian and you can manage your
          preferences and options at anytime under&nbsp;
          <ExternalLink href={locations.MMA_EMAIL_PREFERENCES} subdued={true}>
            Emails &amp; marketing
          </ExternalLink>
          .
        </p>
      )}
      <div css={[autoRow()]}>
        {!!productConsents.length && (
          <ReviewTableRow title="Emails">
            {productConsents.map((c) => (
              <div key={c.id} css={consentStyles}>
                <span css={iconStyles}>
                  <SvgTickRound />
                </span>
                <p css={[text, itemText]}>{c.name}</p>
              </div>
            ))}
          </ReviewTableRow>
        )}
        {!!subscribedNewsletters.length && (
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
        )}
        {optedIntoProfiling && (
          <ReviewTableRow title="Data">
            <div css={consentStyles}>
              <span css={iconStyles}>
                <SvgTickRound />
              </span>
              <p css={[text, itemText]}>
                Allow analysis of my data for marketing
              </p>
            </div>
          </ReviewTableRow>
        )}
        {shouldPersonalisedAdvertisingRender &&
          optedIntoPersonalisedAdvertising && (
            <div css={[consentStyles, noTopBorder]}>
              <span css={iconStyles}>
                <SvgTickRound />
              </span>
              <p css={[text, itemText]}>
                Allow personalised advertising using my data - this supports the
                Guardian
              </p>
            </div>
          )}
      </div>

      {shouldPersonalisedAdvertisingRender && anyConsents && (
        <p css={[marketingText, paddingTop, autoRow()]}>
          You can change these anytime in your account under&nbsp;
          <ExternalLink href={locations.MMA_EMAIL_PREFERENCES} subdued={true}>
            Emails &amp; marketing
          </ExternalLink>
          .
        </p>
      )}
      {!shouldPersonalisedAdvertisingRender && anyConsents && (
        <p css={[text, paddingTop, autoRow()]}>
          You can change these anytime in your account under&nbsp;
          <ExternalLink href={locations.MMA_EMAIL_PREFERENCES} subdued={true}>
            Emails &amp; marketing
          </ExternalLink>
          .
        </p>
      )}
      {!subscribedNewsletters.length && (
        <>
          <h2 css={[heading, autoRow(), greyBorderTop, marginTop]}>
            Guardian newsletters
          </h2>
          <p css={[text, autoRow()]}>Didn’t find anything you like?</p>
          <p css={[text, autoRow()]}>
            We have over&nbsp;
            <ExternalLink href={locations.MMA_EMAIL_PREFERENCES} subdued={true}>
              40 different newsletters
            </ExternalLink>
            &nbsp;that focus on a range of diverse topics - from politics to the
            latest tech documentaries, sport and scientific breakthroughs.
          </p>
        </>
      )}
      <div css={[controls, autoRow()]}>
        <ExternalLinkButton
          iconSide="right"
          href={returnUrl}
          cssOverrides={returnButton}
        >
          Return to the Guardian
        </ExternalLinkButton>
      </div>
    </ConsentsLayout>
  );
};
