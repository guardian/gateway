import React, { useContext } from 'react';
import { getProviderById } from '@/shared/lib/emailProvider';
import { LinkButton } from '@guardian/src-button';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { linkButton } from '@/client/styles/Shared';
import { SignInLayout } from '@/client/layouts/SignInLayout';
import { SvgArrowRightStraight } from '@guardian/src-icons';

export const ResetSentPage = () => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { pageData: { emailProvider: emailProviderId } = {} } = globalState;
  const emailProvider = getProviderById(emailProviderId);

  return (
    <SignInLayout>
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
        {emailProvider && (
          <LinkButton
            css={linkButton}
            href={emailProvider.inboxLink}
            priority="tertiary"
            icon={<SvgArrowRightStraight />}
            iconSide="right"
          >
            Go to your {emailProvider.name} inbox
          </LinkButton>
        )}
      </PageBox>
    </SignInLayout>
  );
};
