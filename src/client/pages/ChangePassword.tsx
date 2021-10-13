import React from 'react';
import { PasswordForm } from '@/client/components/PasswordForm';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { FieldError } from '@/shared/model/ClientState';

type Props = {
  submitUrl: string;
  email: string;
  fieldErrors: FieldError[];
};

export const ChangePassword = ({ submitUrl, email, fieldErrors }: Props) => (
  <>
    <Header />
    <Main subTitle="Sign in">
      <PageBox>
        <PageHeader>Set Password</PageHeader>
        <PageBody>
          <PageBodyText>
            Please enter your new password for {email}
          </PageBodyText>
          <PasswordForm
            submitUrl={submitUrl}
            fieldErrors={fieldErrors}
            labelText="New Password"
            submitButtonText="Save password"
          />
        </PageBody>
      </PageBox>
    </Main>
    <Footer />
  </>
);
