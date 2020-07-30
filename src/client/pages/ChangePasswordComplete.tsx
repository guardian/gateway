import React from 'react';
import { LinkButton } from '@guardian/src-button';
import { useQuery } from '@/client/lib/useQuery';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBodyText } from '@/client/components/PageBodyText';
import { PageBody } from '@/client/components/PageBody';
import { linkButton } from '@/client/styles/Shared';
import { SignInLayout } from '../layouts/signin';

export const ChangePasswordCompletePage = () => {
  const { returnUrl } = useQuery();
  return (
    <SignInLayout>
      <PageBox>
        <PageHeader>Password Changed</PageHeader>
        <PageBody>
          <PageBodyText>
            Thank you! Your password has been changed.
          </PageBodyText>
          <PageBodyText>
            You&rsquo;ve completed updating your Guardian account. Please click
            the button below to jump back to the Guardian.
          </PageBodyText>
        </PageBody>
        <LinkButton css={linkButton} showIcon href={returnUrl}>
          Continue to The Guardian
        </LinkButton>
      </PageBox>
    </SignInLayout>
  );
};
