import React from 'react';
import { LinkButton, buttonReaderRevenue } from '@guardian/src-button';
import { useQuery } from '@/client/lib/useQuery';
import { ThemeProvider } from 'emotion-theming';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBodyText } from '@/client/components/PageBodyText';
import { PageBody } from '@/client/components/PageBody';
import { linkButton } from '@/client/styles/Shared';

export const ChangePasswordCompletePage = () => {
  const { returnUrl } = useQuery();
  return (
    <PageBox>
      <PageHeader>Thank you! Your password has been changed.</PageHeader>
      <PageBody>
        <PageBodyText>
          You&rsquo;ve completed updating your Guardian account. Please click
          the button below to jump back to the Guardian.
        </PageBodyText>
      </PageBody>
      <ThemeProvider theme={buttonReaderRevenue}>
        <LinkButton css={linkButton} showIcon href={returnUrl}>
          Continue
        </LinkButton>
      </ThemeProvider>
    </PageBox>
  );
};
