import React from 'react';
import { PasswordForm } from '@/client/components/PasswordForm';
import { FieldError } from '@/shared/model/ClientState';
import { ConsentsLayout } from '@/client/layouts/ConsentsLayout';
import {
  ConsentsContent,
  CONSENTS_MAIN_COLOR,
} from '@/client/layouts/shared/Consents';
import { getAutoRow, gridItemColumnConsents } from '@/client/styles/Grid';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';

type Props = {
  submitUrl: string;
  fieldErrors: FieldError[];
};

export const Welcome = ({ submitUrl, fieldErrors }: Props) => {
  const autoRow = getAutoRow(1, gridItemColumnConsents);
  return (
    <ConsentsLayout
      title="Welcome to the Guardian"
      current={CONSENTS_PAGES.PASSWORD}
      bgColor={CONSENTS_MAIN_COLOR}
      showContinueButton={false}
    >
      <ConsentsContent>
        <PasswordForm
          submitUrl={submitUrl}
          fieldErrors={fieldErrors}
          labelText="Password"
          submitButtonText="Save and continue"
          gridAutoRow={autoRow}
        />
      </ConsentsContent>
    </ConsentsLayout>
  );
};
