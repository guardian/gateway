import React from 'react';
import { buttonStyles, MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import { Link, LinkButton } from '@guardian/source-react-components';

interface Props {
  email: string;
  continueLink: string;
  signOutLink: string;
  isNativeApp?: boolean;
}

export const SignedInAs = ({
  email,
  continueLink,
  signOutLink,
  isNativeApp,
}: Props) => (
  <MainLayout
    pageHeader={`Sign in to the Guardian${isNativeApp ? ' app' : ''}`}
  >
    <MainBodyText noMargin>
      You are signed in with <br />
      <b>{email}</b>.
    </MainBodyText>
    <LinkButton
      css={buttonStyles({
        halfWidth: true,
        halfWidthAtMobile: true,
        hasMarginBottom: true,
      })}
      href={continueLink}
    >
      Continue
    </LinkButton>
    <MainBodyText noMargin>
      <Link href={signOutLink}>Sign in</Link> with a different email.
    </MainBodyText>
  </MainLayout>
);
