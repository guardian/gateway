import * as React from 'react';
import { css } from '@emotion/core';
import { brand, palette, space } from '@guardian/src-foundations';
import locations from '@/client/lib/locations';
import { textSans } from '@guardian/src-foundations/typography';

const footer = css`
  background-color: ${brand[400]};
  padding: ${space[1]}px ${space[3]}px;
`;

const p = css`
  color: ${palette.neutral[100]};
  margin: 0;
  ${textSans.small()};
`;

const a = css`
  color: ${palette.neutral[100]};
  text-decoration: none;
  ${textSans.small()};
`;

const ul = css`
  list-style: none;
  padding: 0;
  column-count: 2;
  column-gap: 0;
`;

const li = css`
  padding: ${space[1]}px 0;
`;

const link = (label: string, href: string) => (
  <li css={li}>
    <a css={a} href={href}>
      {label}
    </a>
  </li>
);

export const Footer = () => (
  <footer css={footer}>
    <p css={p}>
      &copy; {new Date().getFullYear()} Guardian News &amp; Media Limited or its
      affiliated companies. All rights reserved.
    </p>
    <ul css={ul}>
      {link('Help', locations.HELP)}
      {link('Terms & Conditions', locations.TERMS)}
      {link('Contact us', locations.CONTACT_US)}
      {link('Privacy policy', locations.PRIVACY)}
      {link('Report technical issue', locations.REPORT_ISSUE)}
      {link('Cookie Policy', locations.COOKIE_POLICY)}
    </ul>
  </footer>
);
