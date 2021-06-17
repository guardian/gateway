import React from 'react';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';

export const ResetSent = () => {
  return (
    <>
      <Header />
      <Main subTitle="Sign in">
        <PageBox>
          <PageHeader>Please check your inbox</PageHeader>
          <PageBody>
            <PageBodyText>
              We’ve sent you an email – please open it up and click on the
              button. This is so we can verify it’s you and help you create a
              password to complete your Guardian account.
            </PageBodyText>
            <PageBodyText>
              Note that the link is only valid for 30 minutes, so be sure to
              open it soon! Thank you.
            </PageBodyText>
          </PageBody>
        </PageBox>
      </Main>
      <Footer />
    </>
  );
};
