import React, { useContext } from 'react';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { PasswordResetDialog } from '@/client/components/PasswordResetDialog';
import { SignInLayout } from '../layouts/signin';

export const ResendPasswordPage = () => {
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { email = '' } = globalState;

  return (
    <SignInLayout>
      <PasswordResetDialog
        email={email}
        headerText="Forgotten password link expired"
        bodyText="Oh no! The link has expired. Enter your email address and we'll send you another link to change or set your password."
        buttonText="Send me another"
      />
    </SignInLayout>
  );
};
