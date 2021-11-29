import React from 'react';

import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

export const ResetPassword = () => {
  return (
    <Page title="Password reset">
      <Header />
      <SubHeader>Password reset</SubHeader>
      <Text>Hello,</Text>
      <Text>
        You&apos;ve asked us to send you a link to reset your password.
      </Text>
      <Text noPaddingBottom>This link is only valid for 30 minutes.</Text>
      <Button href={'$passwordResetLink'}>Reset password</Button>
      <Footer
        mistakeParagraphComponent={
          <>
            If you didn&apos;t request to reset your password, please ignore
            this email. Your details won&apos;t be changed and no one has
            accessed your account.
          </>
        }
      />
    </Page>
  );
};
