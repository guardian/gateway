import React, { useContext } from 'react';
import { getProviderById } from '@/shared/lib/emailProvider';
import { LinkButton } from '@guardian/src-button';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { resetPasswordBox, header, main, h2, p } from '@/client/styles/Reset';

export const ResetSentPage = () => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { emailProvider: emailProviderId } = globalState;
  const emailProvider = getProviderById(emailProviderId);

  return (
    <div css={resetPasswordBox}>
      <div css={header}>
        <p css={h2}>Please check your inbox</p>
      </div>
      <div css={main}>
        <p css={p}>
          We’ve sent you an email – please open it up and click on the button.
          This is so we can verify it’s you and help you create a password to
          complete your Guardian account.
        </p>
        <p css={p}>
          Note that the link is only valid for 30 minutes, so be sure to open it
          soon! Thank you.
        </p>
        {emailProvider && (
          <LinkButton
            href={emailProvider.inboxLink}
            priority="tertiary"
            showIcon={true}
          >
            Go to your {emailProvider.name} inbox
          </LinkButton>
        )}
      </div>
    </div>
  );
};
