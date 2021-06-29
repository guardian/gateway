import React from 'react';

import { MjmlColumn, MjmlSection } from 'mjml-react';

import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

type Props = {
  token: string;
};

export const ResetPassword = ({ token }: Props) => {
  console.log('token:', token);
  return (
    <Page>
      <Header />

      <SubHeader>Reset password</SubHeader>
      <Text>
        <p>Hello,</p>
        <p>You’ve requested us to send you a link to reset your password.</p>
        <p>Please click the button below to reset your password.</p>
      </Text>
      <MjmlSection background-color="#FFFFFF" padding="0">
        <MjmlColumn>
          <Button href="https://profile.theguardian.com">Reset password</Button>
        </MjmlColumn>
      </MjmlSection>

      <Footer />
    </Page>
  );
};
