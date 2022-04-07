import React from 'react';
import { css } from '@emotion/react';
import {
  neutral,
  space,
  remSpace,
  textSans,
} from '@guardian/source-foundations';
import {
  getAutoRow,
  gridItemColumnConsents,
  gridItemYourData,
  gridRow,
  subGridItemToggleSwitch,
  subGridOverrides,
} from '@/client/styles/Grid';
import { Consent } from '@/shared/model/Consent';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import {
  heading,
  text,
  textBold,
  greyBorderTop,
  subText,
} from '@/client/styles/Consents';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { ExternalLink } from '../components/ExternalLink';
import locations from '@/shared/lib/locations';
import { ToggleSwitchInput } from '../components/ToggleSwitchInput';

import { ConsentsForm } from '@/client/components/ConsentsForm';
import { ConsentsNavigation } from '@/client/components/ConsentsNavigation';

type ConsentsDataProps = {
  profiling?: Consent;
  advertising?: Consent;
};

const topMargin = css`
  margin: ${space[4]}px 0 0 0;
`;

const removeMargin = css`
  margin: 0;
  -ms-grid-row: 1; /* fix top margin on IE11 */
`;

const switchRow = css`
  border: 0;
  padding: 0;
  ${topMargin}
  ${textSans.medium()}
`;

const toggleSwitchAlignment = css`
  justify-content: space-between;
  span {
    align-self: flex-start;
    margin-top: 4px;
  }
`;

const listBullets = css`
  list-style: none;
  padding-left: 0;
  margin: 0;
  text-indent: -20px; /* second line indentation */
  margin-left: 20px; /* second line indentation */
  li:first-of-type {
    margin-top: 6px;
  }
  /* ::marker is not supported in IE11 */
  li::before {
    content: '';
    margin-right: ${space[2]}px;
    margin-top: ${space[2]}px;
    background-color: ${neutral[86]};
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
`;

const labelStyles = css`
  ${textBold}
  label {
    line-height: ${remSpace[6]};
  }
`;

const adConsentText = css`
  ${subText}
  line-height: ${remSpace[5]};
  color: ${neutral[46]};
  p {
    ${removeMargin}
    margin-top: 6px;
  }
  && ul {
    text-indent: -18px; /* second line indentation */
    margin-left: 18px; /* second line indentation */
  }
  && li {
    ${textSans.small()}
    line-height: ${remSpace[5]};
  }
  && li::before {
    width: 10px;
    height: 10px;
  }
`;

const marketingText = css`
  p {
    ${subText}
    color: ${neutral[20]};
  }
  a,
  p {
    ${textSans.small()}
    line-height: ${remSpace[5]};
  }
  p:last-of-type {
    margin-top: 6px;
  }
`;

export const ConsentsData = ({ profiling, advertising }: ConsentsDataProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  const autoYourDataRow = getAutoRow(1, gridItemYourData);
  const autoSwitchRow = getAutoRow(1, subGridItemToggleSwitch);

  const layoutProps = { title: 'Your data', current: CONSENTS_PAGES.YOUR_DATA };

  if (!profiling && !advertising) {
    return (
      <ConsentsLayout {...layoutProps}>
        <ConsentsForm cssOverrides={autoRow()}>
          <ConsentsNavigation />
        </ConsentsForm>
      </ConsentsLayout>
    );
  }

  return (
    <ConsentsLayout {...layoutProps}>
      <h2 css={[heading, greyBorderTop, autoRow(), removeMargin]}>
        What we mean by your data
      </h2>
      <ul css={[text, listBullets, autoYourDataRow()]}>
        <li>Information you provide e.g. email address</li>
        <li>Products or services you buy from us</li>
        <li>
          Pages you view on theguardian.com or other Guardian websites when
          signed in
        </li>
      </ul>

      <ConsentsForm cssOverrides={autoRow()}>
        <div css={[gridRow, subGridOverrides]}>
          {!!profiling && (
            <fieldset css={[switchRow, greyBorderTop, autoSwitchRow()]}>
              <ToggleSwitchInput
                id={profiling.id}
                label={profiling.name}
                defaultChecked={profiling.consented ?? true} // legitimate interests so defaults to true
                cssOverrides={[labelStyles, toggleSwitchAlignment]}
              />
            </fieldset>
          )}

          {!!advertising && (
            <>
              <fieldset css={[switchRow, greyBorderTop, autoSwitchRow()]}>
                <ToggleSwitchInput
                  id={advertising.id}
                  label={advertising.name}
                  defaultChecked={advertising.consented ?? false}
                  cssOverrides={[labelStyles, toggleSwitchAlignment]}
                />
              </fieldset>
              <div css={[adConsentText, autoSwitchRow()]}>
                <p>
                  Advertising is a crucial source of our funding. You won&apos;t
                  see more ads, and your data won&apos;t be shared with third
                  parties to use for their own advertising.
                </p>
                <p>We do this by:</p>
                <ul css={[listBullets]}>
                  <li>
                    Analysing your information to predict what you might be
                    interested in.
                  </li>
                  <li>
                    Checking if you are already a customer of other trusted
                    partners.
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div css={[greyBorderTop, topMargin, autoRow()]} />

        <div css={[marketingText, gridRow, subGridOverrides]}>
          <p css={[autoSwitchRow()]}>
            You can change your settings under&nbsp;
            <ExternalLink href={locations.MMA_EMAIL_PREFERENCES} subdued={true}>
              Emails &amp; marketing
            </ExternalLink>
            &nbsp;on your Guardian account at any time.
          </p>
          <p css={[autoSwitchRow()]}>
            Learn how we use data in our{' '}
            <ExternalLink href={locations.PRIVACY} subdued={true}>
              privacy policy
            </ExternalLink>
            .
          </p>
        </div>

        <ConsentsNavigation />
      </ConsentsForm>
    </ConsentsLayout>
  );
};
