import React from 'react';
import { css } from '@emotion/core';
import { space, neutral } from '@guardian/src-foundations';
import { headline, textSans } from '@guardian/src-foundations/typography';
import { from } from '@guardian/src-foundations/mq';
import { LinkButton, buttonReaderRevenue } from '@guardian/src-button';
import { useQuery } from '@/client/lib/useQuery';
import { ThemeProvider } from 'emotion-theming';

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

const linkButton = css`
  margin: ${space[2]}px ${space[3]}px;
  width: auto;

  ${from.mobileMedium} {
    width: max-content;
  }
`;

export const ChangePasswordCompletePage = () => {
  const { returnUrl } = useQuery();
  return (
    <>
      <h1 css={h1}>Thank you! Your password has been changed.</h1>
      <hr css={hr} />
      <p css={p}>
        You&rsquo;ve completed updating your Guardian account. Please click the
        button below to jump back to the Guardian.
      </p>
      <ThemeProvider theme={buttonReaderRevenue}>
        <LinkButton css={linkButton} showIcon href={returnUrl}>
          Continue
        </LinkButton>
      </ThemeProvider>
    </>
  );
};
