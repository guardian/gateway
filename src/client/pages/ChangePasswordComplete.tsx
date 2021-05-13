import React from 'react';
import { LinkButton } from '@guardian/src-button';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBodyText } from '@/client/components/PageBodyText';
import { PageBody } from '@/client/components/PageBody';
import { linkButton } from '@/client/styles/Shared';
import { Layout } from '@/client/layouts/Layout';
import { SvgArrowRightStraight } from '@guardian/src-icons';

type ChangePasswordCompleteProps = {
  returnUrl: string;
};

export const ChangePasswordComplete = ({
  returnUrl,
}: ChangePasswordCompleteProps) => {
  return (
    <Layout>
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
        <LinkButton
          css={linkButton}
          iconSide="right"
          nudgeIcon={true}
          icon={<SvgArrowRightStraight />}
          href={returnUrl}
        >
          Continue to The Guardian
        </LinkButton>
      </PageBox>
    </Layout>
  );
};
