import React from 'react';
import { css } from '@emotion/react';
import { Link } from '@guardian/src-link';
import { textSans } from '@guardian/src-foundations/typography';
import { from } from '@guardian/src-foundations/mq';
import { space } from '@guardian/src-foundations';

const Text = ({ children }: { children: React.ReactNode }) => (
  <p
    css={css`
      ${textSans.xxsmall()}
      margin-top: 0;
      margin-bottom: 0px;
      ${from.mobileMedium} {
        margin-bottom: 6px;
      }
      ${from.tablet} {
        margin-bottom: ${space[2]}px;
      }
    `}
  >
    {children}
  </p>
);

const TermsLink = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => (
  <Link
    subdued={true}
    cssOverrides={css`
      ${textSans.xxsmall()}
    `}
    href={href}
  >
    {children}
  </Link>
);

const terms = css`
  margin-top: ${space[3]}px;
  ${from.mobileMedium} {
    margin-top: ${space[4]}px;
  }
  ${from.tablet} {
    margin-top: ${space[3]}px;
  }
`;

export const Terms = () => (
  <div css={terms}>
    <Text>
      By proceeding, you agree to our{' '}
      <TermsLink href="https://www.theguardian.com/help/terms-of-service">
        terms &amp; conditions
      </TermsLink>
      .
    </Text>
    <Text>
      For information about how we use your data, see our{' '}
      <TermsLink href="https://www.theguardian.com/help/privacy-policy">
        privacy policy
      </TermsLink>
      .
    </Text>
    <Text>
      This site is protected by reCAPTCHA and the Google{' '}
      <TermsLink href="https://policies.google.com/privacy">
        privacy policy
      </TermsLink>{' '}
      and{' '}
      <TermsLink href="https://policies.google.com/terms">
        terms of service
      </TermsLink>{' '}
      apply.
    </Text>
  </div>
);
