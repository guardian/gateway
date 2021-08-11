import React from 'react';
import { PasswordForm } from '@/client/components/PasswordForm';
import { FieldError } from '@/shared/model/ClientState';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import { ConsentsContent } from '@/client/layouts/shared/Consents';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { text } from '@/client/styles/Consents';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';

type Props = {
  submitUrl: string;
  email: string;
  fieldErrors: FieldError[];
};

export const Welcome = ({ submitUrl, email, fieldErrors }: Props) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  return (
    <ConsentsLayout
      title="Welcome to the Guardian"
      current={CONSENTS_PAGES.PASSWORD}
      hideContinueButton
    >
      <ConsentsContent>
        <p css={[text, autoRow()]}>
          Please create a password for {email || 'your new account'}
        </p>
        <PasswordForm
          submitUrl={submitUrl}
          fieldErrors={fieldErrors}
          submitButtonText="Create password"
          gridAutoRow={autoRow}
        />
      </ConsentsContent>
    </ConsentsLayout>
  );
};
