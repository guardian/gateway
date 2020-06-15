import React, { useContext } from 'react';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { PasswordResetDialog } from '@/client/components/PasswordResetDialog';
import { useLocation } from 'react-router-dom';

export const ResetPasswordPage = () => {
  const { search } = useLocation();
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { email = '' } = globalState;

  return (
    <PasswordResetDialog
      email={email}
      headerText="Forgotten or need to set your password?"
      bodyText="We will email you a link to reset it."
      buttonText="Reset Password"
      queryString={search}
    />
  );
};
