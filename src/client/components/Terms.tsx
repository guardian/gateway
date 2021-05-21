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

const TermsLink = ({ children }: { children: React.ReactNode }) => (
  <Link
    cssOverrides={css`
      ${textSans.small()}
    `}
  >
    {children}
  </Link>
);

export const Terms = () => (
  <>
    <Text>
      By proceeding you agree to our <TermsLink>Terms and Conditions</TermsLink>
    </Text>
    <Text>
      You also confirm that you are 13 years or older, or that you have the
      consent of your parent or a person holding parental responsibility
    </Text>
    <Text>
      This site is protected by reCAPTCHA and{' '}
      <TermsLink>Google&apos;s Privacy Policy</TermsLink> and{' '}
      <TermsLink>Terms of Service</TermsLink> apply.
    </Text>
  </>
);
