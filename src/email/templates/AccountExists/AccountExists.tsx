import React from 'react';

import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Link } from '@/email/components/Link';
import { Footer } from '@/email/components/Footer';

export const AccountExists = () => {
  return (
    <Page>
      <Header />
      <SubHeader>This account already exists</SubHeader>
      <Text>
        <p>Hello again,</p>
        <p>
          <strong>You are already registered with the Guardian.</strong>
        </p>
        <p>
          Know your password? <Link href={'$signInLink'}>Sign in</Link>
        </p>
        <p>If you forgot your password, you can click below to reset it.</p>
        <p>This link is only valid for 30 minutes.</p>
      </Text>
      <Button href="$passwordResetLink">Reset password</Button>
      <Footer
        mistakeParagraphComponent={
          <p>
            If you didn’t try to register, please ignore this email. Your
            details won’t be changed and no one has accessed your account.
          </p>
        }
      />
    </Page>
  );
};
