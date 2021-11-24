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
    <Page title="No account">
      <Header />
      <SubHeader>You don&apos;t have an account</SubHeader>
      <Text>Hello,</Text>
      <Text>
        <strong>You are not registered with The Guardian</strong>
      </Text>
      <Text>
        It&apos;s quick an easy to create an account and we won&apos;t ask you
        for personal details.
      </Text>
      <Text noPaddingBottom>Please click below to register.</Text>
      <Button href={`${profileUrl}${buildUrl(Routes.REGISTRATION)}`}>
        Register with The Guardian
      </Button>
      <Footer
        mistakeParagraphComponent={
          <>
            If you received this email by mistake, simply delete it. You
            won&apos;t be registered if you don&apos;t click the confirmation
            button above.
          </>
        }
      />
    </Page>
  );
};
