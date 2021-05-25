import React from 'react';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';

export const SignIn = () => (
  <>
    <Header />
    <Main subTitle="Sign in">
      <PageBox>
        <PageHeader>Sign in</PageHeader>
        <PageBody>
          <PageBodyText>Body text</PageBodyText>
        </PageBody>
      </PageBox>
    </Main>
    <Footer />
  </>
);
