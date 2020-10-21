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
import {
  PasswordMatchingValidationComponent,
  PasswordValidationComponent,
} from '@/client/components/PasswordValidation';
import {
  passwordValidation,
  PasswordValidationText,
} from '@/shared/lib/PasswordValidation';

export const ChangePasswordPage = () => {
  const { search } = useLocation();
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { email = '', fieldErrors = [] } = globalState;
  const { token } = useParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [passwordRepeated, setPasswordRepeated] = useState('');
  const [showRedValidationErrors, setRedValidationErrors] = useState(false);
  const [showMatchingPasswordOutput, setShowMatchPasswordOutput] = useState(
    false,
  );

  const serverErrorMessage: string | undefined = fieldErrors.find(
    (fieldError) => fieldError.field === 'password',
  )?.message;

  const [validationErrorMessage, setValidationErrorMessage] = useState(
    serverErrorMessage || '',
  );

  const repeatedPasswordServerErrorMessage:
    | string
    | undefined = fieldErrors.find(
    (fieldError) => fieldError.field === 'password_confirm',
  )?.message;

  const [matchingErrorMessage, setMatchingErrorMessage] = useState(
    repeatedPasswordServerErrorMessage || '',
  );

  if (!showRedValidationErrors && validationErrorMessage !== '') {
    setRedValidationErrors(true);
  }

  if (
    !showMatchingPasswordOutput &&
    password !== '' &&
    password === passwordRepeated
  ) {
    setShowMatchPasswordOutput(true);
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setValidationErrorMessage('');
    setMatchingErrorMessage('');

    const passwordsMatch = password === passwordRepeated;
    const validateResult = passwordValidation(password);
    if (validateResult.failedMessage || !passwordsMatch) {
      if (validateResult.failedMessage) {
        setValidationErrorMessage(validateResult.failedMessage);
      }
      if (!passwordsMatch) {
        setMatchingErrorMessage(PasswordValidationText.DO_NOT_MATCH_ERROR);
      }

      e.preventDefault();
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
              onBlur={() => setRedValidationErrors(true)}
            />
            <PasswordValidationComponent
              password={password}
              showRedValidationErrors={showRedValidationErrors}
            />
            <TextInput
              css={textInput}
              label="Repeat Password"
              name="password_confirm"
              type="password"
              error={matchingErrorMessage}
              onChange={(e) => setPasswordRepeated(e.target.value)}
              onBlur={() => setShowMatchPasswordOutput(true)}
            />
            <PasswordMatchingValidationComponent
              password={password}
              passwordRepeated={passwordRepeated}
              display={showMatchingPasswordOutput}
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
