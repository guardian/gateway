import React from 'react';
import { css } from '@emotion/react';
import { neutral, space, textSans } from '@guardian/source-foundations';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import {
  heading,
  text,
  headingMarginSpace6,
  greyBorderTop,
} from '@/client/styles/Consents';
import { Checkbox, CheckboxGroup } from '@guardian/source-react-components';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { Consents } from '@/shared/model/Consent';

import { ConsentsContent } from '@/client/layouts/shared/Consents';

type ConsentsDataProps = {
  consented?: boolean;
  description?: string;
};

const fieldset = css`
  border: 0;
  padding: 0;
  margin: ${space[6]}px 0 0 0;
  ${textSans.medium()}
`;

const checkboxLabel = css`
  color: ${neutral[7]};
`;

const marketingText = css`
  ${text}
  margin-top: ${space[4]}px;
`;

export const ConsentsData = ({ consented, description }: ConsentsDataProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);

  const label = <span css={checkboxLabel}>{description}</span>;

  return (
    <ConsentsLayout title="Your data" current={CONSENTS_PAGES.YOUR_DATA}>
      {description && (
        <ConsentsContent>
          <h2 css={[heading, greyBorderTop, autoRow()]}>
            We never share your data without your permission
          </h2>
          <p css={[text, autoRow()]}>
            We think carefully about our use of personal data and use it
            responsibly. We have a team who are dedicated to keeping any data we
            collect safe and secure. You can find out more about how The
            Guardian aims to safeguard users data by going to the Privacy
            section of the website.
          </p>
          <h2 css={[heading, headingMarginSpace6, autoRow()]}>
            Using your data for marketing analysis
          </h2>
          <p css={[text, autoRow()]}>
            From time to time we may use your personal data for marketing
            analysis. That includes looking at what products or services you
            have bought from us and what pages you have been viewing on
            theguardian.com and other Guardian websites (e.g. Guardian Jobs or
            Guardian Holidays). We do this to understand your interests and
            preferences so that we can make our marketing communication more
            relevant to you.
          </p>
          <div css={autoRow()}>
            <p css={[marketingText, autoRow()]}>
              I am happy for the Guardian to use my personal data for marketing
              analysis purposes
            </p>
            <fieldset css={[fieldset, autoRow()]}>
              <CheckboxGroup name={Consents.PROFILING}>
                <Checkbox
                  value="consent-option"
                  label={label}
                  defaultChecked={consented}
                />
              </CheckboxGroup>
            </fieldset>
          </div>
        </ConsentsContent>
      )}
    </ConsentsLayout>
  );
};
