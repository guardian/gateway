import React from 'react';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBox } from '@/client/components/PageBox';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';

type Props = {
  email?: string;
};

export const EmailSent = ({ email }: Props) => {
  return (
    <>
      <Header />
      <Main subTitle="Sign in">
        <PageBox>
          <PageHeader>Check your email inbox</PageHeader>
          <PageBody>
            {email ? (
              <PageBodyText>We’ve sent an email to {email}.</PageBodyText>
            ) : (
              <PageBodyText>We’ve sent you an email.</PageBodyText>
            )}
            <PageBodyText>
              Please follow the instructions in this email. If you can&apos;t
              find it, it may be in your spam folder.
            </PageBodyText>
            <PageBodyText>The link is only valid for 30 minutes.</PageBodyText>
          </PageBody>
        </PageBox>
      </Main>
      <Footer />
    </>
  );
};
