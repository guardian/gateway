import React, { useContext } from 'react';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { PasswordResetDialog } from '@/client/components/PasswordResetDialog';
import { SignInLayout } from '@/client/layouts/SignInLayout';

export const ResendPasswordPage = () => {
  const clientState: ClientState = useContext(ClientStateContext);
  const { pageData: { email = '' } = {} } = clientState;

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
