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
  gridItemToggleSwitch,
} from '@/client/styles/Grid';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import {
  heading,
  text,
  textBold,
  greyBorderTop,
} from '@/client/styles/Consents';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { ConsentsContent } from '@/client/layouts/shared/Consents';
import { ExternalLink } from '../components/ExternalLink';
import locations from '@/shared/lib/locations';
import { ToggleSwitchInput } from '../components/ToggleSwitchInput';

type ConsentsDataProps = {
  consented?: boolean;
  description?: string;
  name?: string;
  id: string;
};

const switchRow = css`
  border: 0;
  padding: 0;
  margin: ${space[4]}px 0 0 0;
  ${textSans.medium()}
`;

const removeMargin = css`
  margin: 0;
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
  line-height: ${remSpace[6]};
  padding-left: 0;
  text-indent: -18px; // second line indentation
  margin-left: 18px; // second line indentation
  li {
    font-size: 17px;
  }
  li:first-of-type {
    margin-top: ${space[2]}px;
  }
  // ::marker is not supported in IE11
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

const marketingText = css`
  ${text}
  color: ${neutral[46]};
  margin-top: ${space[4]}px;
`;

export const ConsentsData = ({ id, consented, name }: ConsentsDataProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  const autoSwitchRow = getAutoRow(1, gridItemToggleSwitch);

  return (
    <ConsentsLayout title="Your data" current={CONSENTS_PAGES.YOUR_DATA}>
      {name && (
        <ConsentsContent>
          <h2 css={[heading, removeMargin, greyBorderTop, autoRow()]}>
            What we mean by your data
          </h2>
          <ul css={[text, listBullets, autoSwitchRow()]}>
            <li>Information you provide e.g. email address</li>
            <li>Products or services you buy from us</li>
            <li>
              Pages you view on theguardian.com or other Guardian websites when
              signed in
            </li>
          </ul>

          <fieldset css={[switchRow, greyBorderTop, autoSwitchRow()]}>
            <ToggleSwitchInput
              id={id}
              // TODO replace with Consent.name once IDAPI model is updated
              label={
                'Allow the Guardian to analyse this data to improve marketing content'
              }
              defaultChecked={consented ?? true} // legitimate interests so defaults to true
              cssOverrides={[labelStyles, toggleSwitchAlignment]}
            />
          </fieldset>
          <div css={[autoRow()]}>
            <p css={[marketingText, greyBorderTop, autoRow()]}>
              You can change your settings under&nbsp;
              <ExternalLink
                href={locations.MMA_EMAIL_PREFERENCES}
                subdued={true}
              >
                Emails &amp; marketing
              </ExternalLink>
              &nbsp;on your Guardian account at any time.
            </p>
            <p css={[marketingText, autoRow()]}>
              Learn how we use data in our{' '}
              <ExternalLink href={locations.PRIVACY} subdued={true}>
                privacy policy
              </ExternalLink>
              .
            </p>
          </div>
        </ConsentsContent>
      )}
    </ConsentsLayout>
  );
};
