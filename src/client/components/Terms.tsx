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
      margin-bottom: ${space[4]}px;
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

export const Terms = () => (
  <>
    <Text>
      By proceeding you agree to our{' '}
      <TermsLink href="https://www.theguardian.com/help/terms-of-service">
        Terms and Conditions
      </TermsLink>
    </Text>
    <Text>
      You also confirm that you are 13 years or older, or that you have the
      consent of your parent or a person holding parental responsibility
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
  </>
);
