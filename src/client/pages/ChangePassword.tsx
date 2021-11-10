import React from 'react';
import { PasswordFormMainLayout } from '@/client/components/PasswordForm';
import { FieldError } from '@/shared/model/ClientState';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';

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
  <MainLayout pageTitle={headerText}>
    <MainBodyText>
      Please enter your new password for <b>{email}</b>
    </MainBodyText>
    <PasswordFormMainLayout
      submitUrl={submitUrl}
      submitButtonText={buttonText}
      fieldErrors={fieldErrors}
      labelText="Password"
    />
  </MainLayout>
);
