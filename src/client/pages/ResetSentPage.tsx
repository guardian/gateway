import React, { useContext } from 'react';
import { css } from '@emotion/core';
import { space, brandAlt } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
import { from } from '@guardian/src-foundations/mq';
import { getProviderById } from '@/shared/lib/emailProvider';
import { LinkButton } from '@guardian/src-button';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';

const border = `2px solid #dcdcdc`;

const header = css`
  background-color: ${brandAlt[400]};
  padding: ${space[2]}px ${space[3]}px;
  border: 2px solid transparent;

  ${from.tablet} {
    margin-top: ${space[12]}px;
  }
`;

const main = css`
  padding: ${space[3]}px ${space[3]}px;
  border: ${border};
`;

const p = css`
  margin-top: 0;
  ${textSans.medium({ lineHeight: 'regular' })}
`;

const headerP = css`
  margin: 0;
  ${textSans.medium({ fontWeight: 'bold', lineHeight: 'regular' })}
`;

export const ResetSentPage = () => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { emailProvider: emailProviderId } = globalState;
  const emailProvider = getProviderById(emailProviderId);

  return (
    <>
      <div css={header}>
        <p css={headerP}>Please check your inbox</p>
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
    </>
  );
};
