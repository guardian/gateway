import React from 'react';
import { SignInLayout } from '@/client/layouts/SignInLayout';
import { Button } from '@guardian/src-button';
import { TextInput } from '@guardian/src-text-input';
import { PageBody } from '../components/PageBody';
import { PageBodyText } from '../components/PageBodyText';
import { PageBox } from '../components/PageBox';
import { PageHeader } from '../components/PageHeader';
import { form, textInput, button } from '@/client/styles/Shared';

export const ResendEmailVerificationPage = () => {
  return (
    <SignInLayout>
      <PageBox>
        <PageHeader>Email Verification Link Expired</PageHeader>
        <PageBody>
          <PageBodyText>
            The original verification email we sent you have now expired. Click
            on the link below and well send you a new one. Note that the link is
            only valid for 30 minutes, so be sure to open it soon!
          </PageBodyText>
          <form css={form} method="post" action="">
            <TextInput
              css={textInput}
              label="Email address"
              name="email"
              type="email"
            />
            <Button css={button} type="submit">
              Resend verification email
            </Button>
          </form>
        </PageBody>
      </PageBox>
    </SignInLayout>
  );
};
