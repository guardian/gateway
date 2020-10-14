import React, { useContext, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { TextInput } from '@guardian/src-text-input';
import { Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { GlobalState } from '@/shared/model/GlobalState';
import { GlobalStateContext } from '@/client/components/GlobalState';
import { Routes } from '@/shared/model/Routes';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { form, textInput, button } from '@/client/styles/Shared';
import { SignInLayout } from '@/client/layouts/SignInLayout';
import { PasswordValidationComponent } from '@/client/components/PasswordValidation';
import { css } from '@emotion/core';
import { palette } from '@guardian/src-foundations';
import { passwordValidation } from '@/shared/lib/PasswordValidation';

export const ChangePasswordPage = () => {
  const { search } = useLocation();
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { email = '', fieldErrors = [] } = globalState;
  const { token } = useParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [passwordRepeated, setPasswordRepeated] = useState('');

  const serverErrorMessage: string | undefined = fieldErrors.find(
    (fieldError) => fieldError.field === 'password',
  )?.message;

  const [validationErrorMessage, setValidationErrorMessage] = useState(
    serverErrorMessage || '',
  );
  const hasSubmissionValidationError = validationErrorMessage !== '';

  const passwordRepeatedErrorStyle = hasSubmissionValidationError
    ? css`
        border: 4px solid ${palette.error['400']};
        color: ${palette.error['400']};
      `
    : undefined;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const validateResult = passwordValidation(password, passwordRepeated);
    if (validateResult.failedMessage) {
      setValidationErrorMessage(validateResult.failedMessage);
      e.preventDefault();
    } else {
      setValidationErrorMessage('');
    }
  };

  return (
    <SignInLayout>
      <PageBox>
        <PageHeader>Reset Password</PageHeader>
        <PageBody>
          <PageBodyText>
            Please enter your new password for {email}
          </PageBodyText>
          <form
            css={form}
            method="post"
            action={`${Routes.CHANGE_PASSWORD}/${token}${search}`}
            onSubmit={onSubmit}
          >
            <TextInput
              css={textInput}
              label="New Password"
              name="password"
              type="password"
              error={validationErrorMessage}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            <TextInput
              css={textInput}
              label="Repeat Password"
              name="password_confirm"
              type="password"
              cssOverrides={passwordRepeatedErrorStyle}
              onChange={(e) => setPasswordRepeated(e.target.value)}
            />
            <PasswordValidationComponent
              password={password}
              passwordRepeated={passwordRepeated}
              hasFailedToSubmit={hasSubmissionValidationError}
            />
            <Button
              css={button}
              type="submit"
              icon={<SvgArrowRightStraight />}
              iconSide="right"
            >
              Save Password
            </Button>
          </form>
        </PageBody>
      </PageBox>
    </SignInLayout>
  );
};
