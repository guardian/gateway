import * as React from 'react';
import { css } from '@emotion/react';
import { brand, palette, space } from '@guardian/src-foundations';
import locations from '@/client/lib/locations';
import { textSans } from '@guardian/src-foundations/typography';
import { MaxWidth } from '@/client/models/Style';
import { from } from '@guardian/src-foundations/mq';

const footer = css`
  background-color: ${brand[400]};
  padding: ${space[1]}px ${space[3]}px;
  flex: 0 0 auto;
`;

const container = css`
  width: 100%;
  max-width: ${MaxWidth.DESKTOP}px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  ${from.tablet} {
    flex-direction: row;
  }
`;

const p = css`
  color: ${palette.neutral[100]};
  margin: 0;
  ${textSans.small()};
  ${from.tablet} {
    width: 320px;
  }
`;

const a = css`
  color: ${palette.neutral[100]};
  text-decoration: none;
  ${textSans.small()};
`;

const ul = css`
  list-style: none;
  padding: 0;
  margin: 0;
  column-count: 2;
  column-gap: 0;
  ${from.tablet} {
    flex: 1 1 auto;
    column-count: auto;
    column-width: 10rem;
    padding: 0px ${space[6]}px;
  }
`;

const li = css`
  padding: ${space[1]}px 0;
  ${from.tablet} {
    padding: 0;
  }
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
    <div css={container}>
      <p css={p}>
        &copy; {new Date().getFullYear()} Guardian News &amp; Media Limited or
        its affiliated companies. All rights reserved.
      </p>
      <ul css={ul}>
        {link('Help', locations.HELP)}
        {link('Terms & Conditions', locations.TERMS)}
        {link('Contact us', locations.CONTACT_US)}
        {link('Privacy policy', locations.PRIVACY)}
        {link('Report technical issue', locations.REPORT_ISSUE)}
        {link('Cookie Policy', locations.COOKIE_POLICY)}
      </ul>
    </div>
  </footer>
);
