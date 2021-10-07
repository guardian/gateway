import React from 'react';

import { Routes } from '@/shared/model/Routes';
import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Link } from '@/email/components/Link';
import { Footer } from '@/email/components/Footer';

interface Props {
  profileUrl: string;
}

export const AccountExists = ({ profileUrl }: Props) => {
  return (
    <Page>
      <Header />
      <SubHeader>This account already exists</SubHeader>
      <Text>
        <p>Hello again,</p>
        <p>
          <strong>You are already registered with the Guardian</strong>
        </p>
        <p>
          You can <Link href="/signin">use this link to sign in</Link>.
        </p>
        <p>If you forgot your password, you can click below to reset it.</p>
      </Text>
      <Button href={`${profileUrl}${Routes.CHANGE_PASSWORD}/TOKEN_PLACEHOLDER`}>
        Reset password
      </Button>
      <Footer
        mistakeParagraphComponent={
          <p>If you received this email by mistake, simply delete it.</p>
        }
      />
    </Page>
  );
};
