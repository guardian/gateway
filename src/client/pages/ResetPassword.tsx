import React, { useContext } from 'react';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { PasswordResetDialog } from '@/client/components/PasswordResetDialog';
import { useLocation } from 'react-router-dom';
import { SignInLayout } from '../layouts/signin';

export const ResetPasswordPage = () => {
  const { search } = useLocation();
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { email = '' } = globalState;

  return (
    <SignInLayout>
      <PasswordResetDialog
        email={email}
        headerText="Forgotten password"
        bodyText="Forgotten or need to set your password? We will email you a link to change or set it."
        buttonText="Reset Password"
        queryString={search}
      />
    </SignInLayout>
  );
};
