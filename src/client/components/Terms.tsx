import React from 'react';
import { css } from '@emotion/react';
import { space } from '@guardian/src-foundations';
import { Link } from '@guardian/src-link';
import { textSans } from '@guardian/src-foundations/typography';

const Text = ({ children }: { children: React.ReactNode }) => (
  <p
    css={css`
      ${textSans.small()}
      margin-top: 0;
      margin-bottom: ${space[2]}px;
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
      ${textSans.small()}
    `}
    href={href}
  >
    {children}
  </Link>
);

const termsStyles = css`
  margin-bottom: ${space[4]}px;
`;

export const Terms = () => (
  <div css={termsStyles}>
    <Text>
      By proceeding, you agree to our{' '}
      <TermsLink href="https://www.theguardian.com/help/terms-of-service">
        terms and conditions
      </TermsLink>
      .
    </Text>
    <Text>
      For information about how we use your data, see our{' '}
      <TermsLink href="https://www.theguardian.com/help/privacy-policy">
        privacy policy.
      </TermsLink>
      .
    </Text>
    <Text>
      This site is protected by reCAPTCHA and{' '}
      <TermsLink href="https://policies.google.com/privacy">
        Google&apos;s Privacy Policy
      </TermsLink>{' '}
      and{' '}
      <TermsLink href="https://policies.google.com/terms">
        Terms of Service
      </TermsLink>{' '}
      apply.
    </Text>
  </div>
);
