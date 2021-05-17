import React from 'react';
import { Layout } from '@/client/layouts/Layout';
import { LinkButton, Button } from '@guardian/src-button';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { form, button, linkButton } from '@/client/styles/Shared';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { css } from '@emotion/react';
import { textSans } from '@guardian/src-foundations/typography';
import { Routes } from '@/shared/model/Routes';
import { CsrfFormField } from '@/client/components/CsrfFormField';

type ResendEmailVerificationProps = {
  email?: string;
  signInPageUrl?: string;
  successText?: string;
  inboxLink?: string;
  inboxName?: string;
};
const bold = css`
  ${textSans.medium({ lineHeight: 'regular', fontWeight: 'bold' })}
`;

const LoggedOut = ({ signInPageUrl }: { signInPageUrl?: string }) => (
  <PageBox>
    <PageHeader>Link Expired</PageHeader>
    <PageBody>
      <PageBodyText>Your email confirmation link has expired</PageBodyText>
      <PageBodyText>
        The link we sent you was valid for 30 minutes. Please sign in again and
        we will resend a verification email.
      </PageBodyText>
      <div css={form}>
        <LinkButton
          href={signInPageUrl}
          css={button}
          icon={<SvgArrowRightStraight />}
          iconSide="right"
        >
          Sign in
        </LinkButton>
      </div>
    </PageBody>
  </PageBox>
);

const LoggedIn = ({
  email,
  successText,
  inboxLink,
  inboxName,
}: {
  email: string;
  successText?: string;
  inboxLink?: string;
  inboxName?: string;
}) => (
  <PageBox>
    <PageHeader>Verify Email</PageHeader>
    <PageBody>
      <PageBodyText>
        You need to confirm your email address to continue securely:
      </PageBodyText>
      <PageBodyText>
        <span css={bold}>{email}</span>
      </PageBodyText>
      <PageBodyText>
        We will send you a verification link to your email to ensure that it’s
        you. Please note that the link will expire in 30 minutes.
      </PageBodyText>
      <PageBodyText>
        If you don&apos;t see it in your inbox, please check your spam filter.
      </PageBodyText>
      {successText ? (
        <PageBodyText>{successText}</PageBodyText>
      ) : (
        <form css={form} method="post" action={Routes.VERIFY_EMAIL}>
          <CsrfFormField />
          <input type="hidden" name="email" value={email} />
          <Button
            css={button}
            type="submit"
            icon={<SvgArrowRightStraight />}
            iconSide="right"
          >
            Send verification link
          </Button>
        </form>
      )}
      {inboxLink && inboxName && (
        <LinkButton
          css={linkButton}
          href={inboxLink}
          icon={<SvgArrowRightStraight />}
          iconSide="right"
          priority="tertiary"
        >
          Go to your {inboxName} inbox
        </LinkButton>
      )}
    </PageBody>
  </PageBox>
);

export const ResendEmailVerification = ({
  email,
  signInPageUrl,
  successText,
  inboxLink,
  inboxName,
}: ResendEmailVerificationProps) => {
  return (
    <Layout subTitle="Sign in">
      {email ? (
        <LoggedIn
          email={email}
          successText={successText}
          inboxLink={inboxLink}
          inboxName={inboxName}
        />
      ) : (
        <LoggedOut signInPageUrl={signInPageUrl} />
      )}
    </Layout>
  );
};
