import React, { useContext } from 'react';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { PasswordResetDialog } from '../components/PasswordResetDialog';

export const ResetPasswordPage = () => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { email = '' } = globalState;

  return (
    <PasswordResetDialog
      email={email}
      headerText="Forgotten or need to set your password?"
      bodyText="We will email you a link to reset it."
      buttonText="Reset Password"
    />
  );
};
