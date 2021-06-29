import React from 'react';

import { MjmlColumn, MjmlSection } from 'mjml-react';

import { Page } from '@/email/components/Page';
import { Button } from '@/email/components/Button';
import { Header } from '@/email/components/Header';
import { SubHeader } from '@/email/components/SubHeader';
import { Text } from '@/email/components/Text';
import { Footer } from '@/email/components/Footer';

type Props = {
  name?: string;
};

export const Example = ({ name = '' }: Props) => (
  <Page>
    <Header />

    <SubHeader>Sign in</SubHeader>

    <Text>
      <p>Hello{name && ` ${name}`},</p>
      <p>You’ve requested a link to sign in to your account.</p>
      <p>Please click the button below to sign in.</p>
    </Text>

    <Button href="https://profile.theguardian.com">
      Sign in to The Guardian
    </Button>

    <Text>
      <p>
        If you prefer you can{' '}
        <a href="https://profile.theguardian.com">create a password</a>.
      </p>
    </Text>

    <Footer />
  </Page>
);
