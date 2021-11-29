import React from 'react';

import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

export const CreatePassword = () => {
  return (
    <Page title="Welcome back">
      <Header />
      <SubHeader>Welcome back</SubHeader>
      <Text>Hello again,</Text>
      <Text>Please click below to create a password for your account.</Text>
      <Text noPaddingBottom>This link is only valid for 30 minutes.</Text>
      <Button href={'$createPasswordLink'}>Create password</Button>
      <Footer
        mistakeParagraphComponent={
          <>
            If you didn&apos;t try to register, please ignore this email. Your
            details won&apos;t be changed and no one has accessed your account.
          </>
        }
      />
    </Page>
  );
};
