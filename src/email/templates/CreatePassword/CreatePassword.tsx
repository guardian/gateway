import React from 'react';

import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

export const CreatePassword = () => {
  return (
    <Page>
      <Header />
      <SubHeader>Welcome back</SubHeader>
      <Text>
        <p>Hello again,</p>
        <p>Please click below to create a password for your account.</p>
        <p>This link is only valid for 30 minutes.</p>
      </Text>
      <Button href={'$createPasswordLink'}>Create password</Button>
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
