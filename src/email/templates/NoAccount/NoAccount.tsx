import React from 'react';

import { Routes } from '@/shared/model/Routes';
import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';
import { buildUrl } from '@/shared/lib/routeUtils';

interface Props {
  profileUrl: string;
}

export const NoAccount = ({ profileUrl }: Props) => {
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
      <Button href={`${profileUrl}${buildUrl(Routes.REGISTRATION)}`}>
        Register with The Guardian
      </Button>
      <Footer
        mistakeParagraphComponent={
          <p>
            If you received this email by mistake, simply delete it. You
            won&apos;t be registered if you don&apos;t click the confirmation
            button above.
          </p>
        }
      />
    </Page>
  );
};
