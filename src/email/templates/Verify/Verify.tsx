import React from 'react';

import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

export const Verify = () => {
  return (
    <Page>
      <Header />
      <SubHeader>Welcome to the Guardian</SubHeader>
      <Text>
        <p>Please click below to complete your registration.</p>
      </Text>
      <Button href="$verificationLink">Complete registration</Button>
      <Footer />
    </Page>
  );
};
