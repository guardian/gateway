import React from 'react';
import { LinkButton } from '@guardian/src-button';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { linkButton } from '@/client/styles/Shared';
import { Layout } from '@/client/layouts/Layout';
import { SvgArrowRightStraight } from '@guardian/src-icons';

type ResetSentProps = {
  inboxLink?: string;
  inboxName?: string;
};

export const ResetSent = ({ inboxLink, inboxName }: ResetSentProps) => {
  return (
    <Layout subTitle="Sign in">
      <PageBox>
        <PageHeader>Please check your inbox</PageHeader>
        <PageBody>
          <PageBodyText>
            We’ve sent you an email – please open it up and click on the button.
            This is so we can verify it’s you and help you create a password to
            complete your Guardian account.
          </PageBodyText>
          <PageBodyText>
            Note that the link is only valid for 30 minutes, so be sure to open
            it soon! Thank you.
          </PageBodyText>
        </PageBody>
        {inboxLink && inboxName && (
          <LinkButton
            css={linkButton}
            href={inboxLink}
            priority="tertiary"
            icon={<SvgArrowRightStraight />}
            iconSide="right"
          >
            Go to your {inboxName} inbox
          </LinkButton>
        )}
      </PageBox>
    </Layout>
  );
};
