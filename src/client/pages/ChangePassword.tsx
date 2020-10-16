import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useContext,
  useState,
} from 'react';
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
  passwordValidation,
  PasswordValidationComponent,
} from '@/client/components/PasswordValidation';
import { css } from '@emotion/core';
import { eyeSymbol } from '@/client/styles/PasswordValidationStyles';

export const ChangePasswordPage = () => {
  const { search } = useLocation();
  const globalState: GlobalState = useContext(GlobalStateContext);
  const { email = '', fieldErrors = [] } = globalState;
  const { token } = useParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [passwordRepeated, setPasswordRepeated] = useState('');
  const [isEyeOpen, setEyeOpen] = useState(true);
  const [isRepeatedEyeOpen, setRepeatedEyeOpen] = useState(true);
  const textOrPassword = isEyeOpen ? 'password' : 'text';
  const textOrPasswordRepeated = isRepeatedEyeOpen ? 'password' : 'text';

  const serverErrorMessage: string | undefined = fieldErrors.find(
    (fieldError) => fieldError.field === 'password',
  )?.message;

  const [validationErrorMessage, setValidationErrorMessage] = useState(
    serverErrorMessage || '',
  );
  const hasSubmissionValidationError = validationErrorMessage !== '';

  const passwordRepeatedErrorStyle = hasSubmissionValidationError
    ? css`
        border: 4px solid rgb(199, 0, 0);
        color: rgb(199, 0, 0);
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
            <InputWithEye
              isOpen={isEyeOpen}
              setEyeOpen={setEyeOpen}
              text={password}
            >
              <TextInput
                css={textInput}
                label="New Password"
                name="password"
                type={textOrPassword}
                error={validationErrorMessage}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </InputWithEye>
            <InputWithEye
              isOpen={isRepeatedEyeOpen}
              setEyeOpen={setRepeatedEyeOpen}
              text={passwordRepeated}
            >
              <TextInput
                css={textInput}
                label="Repeat Password"
                name="password_confirm"
                type={textOrPasswordRepeated}
                cssOverrides={passwordRepeatedErrorStyle}
                onChange={(e) => setPasswordRepeated(e.target.value)}
              />
            </InputWithEye>
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

const showEyeForBrowser = (browserName: string) => {
  // These browsers already show an overlay in place of the eye
  return !(
    browserName === 'Microsoft Edge' ||
    browserName === 'Internet Explorer' ||
    browserName === 'Safari'
  );
};

const InputWithEye: FunctionComponent<{
  setEyeOpen: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  text: string;
}> = (props) => {
  const globalState = useContext<GlobalState>(GlobalStateContext);

  return (
    <div
      css={css`
        position: relative;
      `}
    >
      {showEyeForBrowser(globalState.browserName ?? '') &&
        props.text.length > 0 && (
          <div
            css={eyeSymbol(props.isOpen)}
            className="guardian-password-eye"
            onClick={() => props.setEyeOpen((prevState) => !prevState)}
          />
        )}
      {props.children}
    </div>
  );
};
