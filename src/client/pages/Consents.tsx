import React from 'react';
import Locations from '@/client/lib/locations';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { titlepiece } from '@guardian/src-foundations/typography';
import { css } from '@emotion/core';
import { brand, space } from '@guardian/src-foundations';

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
    </ConsentsLayout>
  );
};
