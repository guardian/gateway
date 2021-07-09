import React from 'react';

import { Routes } from '@/shared/model/Routes';
import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

export const NoAccount = () => {
  return (
    <Page>
      <Header />
      <SubHeader>You don&#39;t have an account</SubHeader>
      <Text>
        <p>Hello,</p>
        <p>
          <strong>You are not registered with The Guardian</strong>
        </p>
        <p>
          It&#39;s quick an easy to create an account and we won&#39;t ask you
          for personal details.
        </p>
        <p>Please click below to register.</p>
      </Text>
      <Button
        href={`https://profile.theguardian.com${Routes.REGISTRATION}/TOKEN_PLACEHOLDER`}
      >
        Register with The Guardian
      </Button>
      <Footer />
    </Page>
  );
};
