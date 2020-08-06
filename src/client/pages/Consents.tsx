import React from 'react';
import Locations from '@/client/lib/locations';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { titlepiece, textSans } from '@guardian/src-foundations/typography';
import { css } from '@emotion/core';
import { brand, space, neutral } from '@guardian/src-foundations';
import { RadioGroup, Radio } from '@guardian/src-radio';
import { gridItem } from '@/client/styles/Grid';

const h3 = css`
  color: ${brand[400]};
  margin: ${space[12]}px 0 ${space[3]}px 0;
  ${titlepiece.small()};
  // Overrides
  font-size: 17px;
  ${gridItem()}
  &:nth-of-type(2) {
    margin-top: ${space[9]}px;
  }
`;

const p = css`
  margin: 0;
  ${textSans.medium()}
  ${gridItem()}
`;

const fieldset = css`
  border: 0;
  padding: 0;
  margin: ${space[9]}px 0 0 0;
  ${textSans.medium()}
  ${gridItem()}
`;

const legend = css`
  color: ${neutral[46]};
  margin: 0 0 ${space[5]}px 0;
  padding: 0;
`;

export const ConsentsPage = () => {
  return (
    <ConsentsLayout>
      <h3 css={h3}>Our commitment to you</h3>
      <p css={p}>
        We think carefully about our use of personal data and use it
        responsibly. We never share it without your permission and we have a
        team who are dedicated to keeping any data we collect safe and secure.
        You can find out more about how The Guardian aims to safeguard users
        data by going to the{' '}
        <a href={Locations.PRIVACY} target="_blank" rel="noopener noreferrer">
          Privacy section
        </a>{' '}
        of the website.
      </p>
      <h3 css={h3}>Using your data for marketing analysis</h3>
      <p css={p}>
        From time to time we may use your personal data for marketing analysis.
        That includes looking at what products or services you have bought from
        us and what pages you have been viewing on theguardian.com and other
        Guardian websites (e.g. Guardian Jobs or Guardian Holidays). We do this
        to understand your interests and preferences so that we can make our
        marketing communication more relevant to you.
      </p>
      <fieldset css={fieldset}>
        <legend css={legend}>
          I am happy for The Guardian to use my personal data for market
          analysis purposes.
        </legend>
        <RadioGroup orientation="horizontal" name="binary">
          <Radio value="yes" label="Yes" defaultChecked={true} />
          <Radio value="no" label="No" />
        </RadioGroup>
      </fieldset>
    </ConsentsLayout>
  );
};
