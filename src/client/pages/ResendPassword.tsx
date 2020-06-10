import React, { useContext } from 'react';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { PasswordResetDialog } from '@/client/components/PasswordResetDialog';

export const ResendPasswordPage = () => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { email = '' } = globalState;

  return (
    <PasswordResetDialog
      email={email}
      headerText="Oh no! The reset password link has expired"
      bodyText="Enter your email address and we'll send you another."
      buttonText="Send me another"
    />
  );
};
