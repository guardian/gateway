import React from 'react';
import Locations from '@/client/lib/locations';
import { textSans } from '@guardian/src-foundations/typography';
import { css } from '@emotion/react';
import { space, neutral } from '@guardian/src-foundations';
import {
  getAutoRow,
  gridItemColumnConsents,
  consentsParagraphSpanDef,
} from '@/client/styles/Grid';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';
import { heading, text, headingMarginSpace6 } from '@/client/styles/Consents';
import { Link } from '@guardian/src-link';
import { Checkbox, CheckboxGroup } from '@guardian/src-checkbox';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import {
  ConsentsContent,
  CONSENTS_MAIN_COLOR,
} from '@/client/layouts/shared/Consents';
import { Consents } from '@/shared/model/Consent';

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
  color: ${neutral[46]};
`;

export const ConsentsData = ({ consented, description }: ConsentsDataProps) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);

  const label = <span css={checkboxLabel}>{description}</span>;

  return (
    <ConsentsLayout
      title="Your data"
      current={CONSENTS_PAGES.YOUR_DATA}
      bgColor={CONSENTS_MAIN_COLOR}
    >
      {description && (
        <ConsentsContent>
          <h2 css={[heading, autoRow()]}>Our commitment to you</h2>
          <p css={[text, autoRow(consentsParagraphSpanDef)]}>
            We think carefully about our use of personal data and use it
            responsibly. We never share it without your permission and we have a
            team who are dedicated to keeping any data we collect safe and
            secure. You can find out more about how The Guardian aims to
            safeguard users data by going to the{' '}
            <Link
              href={Locations.PRIVACY}
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy
            </Link>{' '}
            section of the website.
          </p>
          <h2 css={[heading, headingMarginSpace6, autoRow()]}>
            Using your data for marketing analysis
          </h2>
          <p css={[text, autoRow(consentsParagraphSpanDef)]}>
            From time to time we may use your personal data for marketing
            analysis. That includes looking at what products or services you
            have bought from us and what pages you have been viewing on
            theguardian.com and other Guardian websites (e.g. Guardian Jobs or
            Guardian Holidays). We do this to understand your interests and
            preferences so that we can make our marketing communication more
            relevant to you.
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
        </ConsentsContent>
      )}
    </ConsentsLayout>
  );
};
