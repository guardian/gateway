import React from 'react';
import { css } from '@emotion/react';
import { space, textSans } from '@guardian/source-foundations';
import { ExternalLink } from '@/client/components/ExternalLink';

export const termsContainer = css`
  margin-top: ${space[5]}px;
`;

const Text = ({ children }: { children: React.ReactNode }) => (
  <p
    css={css`
      ${textSans.xxsmall()}
      margin-top: 0;
      margin-bottom: 6px;
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
  <ExternalLink
    cssOverrides={css`
      ${textSans.xxsmall()}
    `}
    href={href}
  >
    {children}
  </ExternalLink>
);

export const GuardianTerms = () => (
  <>
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
  </>
);

export const JobsTerms = () => (
  <>
    <Text>
      By proceeding, you agree to our{' '}
      <TermsLink href="https://jobs.theguardian.com/terms-and-conditions/">
        Guardian Jobs terms &amp; conditions
      </TermsLink>
      .
    </Text>
    <Text>
      For information about how we use your data, see our{' '}
      <TermsLink href="https://jobs.theguardian.com/privacy-policy/">
        Guardian Jobs privacy policy
      </TermsLink>
      .
    </Text>
  </>
);

export const RecaptchaTerms = () => (
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
);
