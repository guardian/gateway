import React from 'react';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { Layout } from '@/client/layouts/Layout';

export const SignIn = () => (
  <Layout subTitle="Sign in">
    <PageBox>
      <PageHeader>Sign in</PageHeader>
      <PageBody>
        <PageBodyText>Body text</PageBodyText>
      </PageBody>
    </PageBox>
  </Layout>
);
