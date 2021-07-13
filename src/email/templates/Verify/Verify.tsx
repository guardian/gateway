import React from 'react';

import { getProfileUrl } from '@/server/lib/getProfileUrl';
import { Routes } from '@/shared/model/Routes';
import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

const profileUrl = getProfileUrl();

export const Verify = () => {
  return (
    <Page>
      <Header />
      <SubHeader>Please verify your email</SubHeader>
      <Text>
        <p>Welcome to the Guardian,</p>
        <p>
          Please click below to verify your emails address and complete your
          registration.
        </p>
      </Text>
      <Button href={`${profileUrl}${Routes.WELCOME}`}>
        Complete registration
      </Button>
      <Footer />
    </Page>
  );
};
