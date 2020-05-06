import React from 'react';
import { css } from '@emotion/core';
import { textSans, headline } from '@guardian/src-foundations/typography';
import locations from '@/client/lib/locations';
import { space, neutral } from '@guardian/src-foundations';
import { Link } from '@guardian/src-link';
import { from } from '@guardian/src-foundations/mq';

const h1 = css`
  margin: 0;
  padding: ${space[2]}px ${space[3]}px;
  ${headline.small()}

  ${from.tablet} {
    ${headline.large()}
  }
`;

const hr = css`
  color: ${neutral[86]};
  margin-left: ${space[3]}px;
  margin-right: ${space[3]}px;
`;

const p = css`
  margin: 0;
  padding: ${space[2]}px ${space[3]}px;
  ${textSans.medium()}
`;

const link = css`
  display: inline-block;
`;

export const NotFound = () => (
  <>
    <h1 css={h1}>Sorry – the page does not exist</h1>
    <hr css={hr} />
    <p css={p}>
      You may have followed an outdated link, or have mistyped a URL. If you
      believe this to be an error, please{' '}
      <Link css={link} href={locations.REPORT_ISSUE}>
        report it
      </Link>
      .
    </p>
  </>
);
