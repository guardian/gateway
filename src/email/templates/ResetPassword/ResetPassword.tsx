import React from 'react';

import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

export const ResetPassword = () => {
  return (
    <Page>
      <Header />
      <SubHeader>Password reset</SubHeader>
      <Text>
        <p>Hello,</p>
        <p>You’ve asked us to send you a link to reset your password.</p>
        <p>This link is only valid for 30 minutes.</p>
      </Text>
      <Button href={'$passwordResetLink'}>Reset password</Button>
      <Footer
        mistakeParagraphComponent={
          <p>
            If you didn’t request to reset your password, please ignore this
            email. Your details won’t be changed and no one has accessed your
            account.
          </p>
        }
      />
    </Page>
  );
};
