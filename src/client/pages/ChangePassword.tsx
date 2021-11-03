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
  headerText: string;
  buttonText: string;
  submitUrl: string;
  email: string;
  fieldErrors: FieldError[];
};

export const ChangePassword = ({
  headerText,
  buttonText,
  submitUrl,
  email,
  fieldErrors,
}: Props) => (
  <>
    <Header />
    <Main subTitle="Sign in">
      <PageBox>
        <PageHeader>{headerText}</PageHeader>
        <PageBody>
          <PageBodyText>
            Please enter your new password for {email}
          </PageBodyText>
          <PasswordForm
            submitUrl={submitUrl}
            fieldErrors={fieldErrors}
            labelText="Password"
            submitButtonText={buttonText}
          />
        </PageBody>
      </PageBox>
    </Main>
    <Footer />
  </>
);
