import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { button, form } from '@/client/styles/Shared';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { PasswordWeakMessage } from '@/client/components/PasswordWeakMessage';
import { PasswordLengthMessage } from '@/client/components/PasswordLengthMessage';
import { space } from '@guardian/src-foundations';
import { css } from '@emotion/react';
import {
  ErrorValidationResult,
  LengthValidationResult,
  PasswordValidationLongMessage,
  PasswordValidationResult,
  validatePasswordLength,
} from '@/shared/lib/PasswordValidation';
import { ValidationStyling } from '@/client/styles/PasswordValidationStyles';
import sha1 from 'js-sha1';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import { PasswordInput } from '@/client/components/PasswordInput';
import { FieldError } from '@/shared/model/ClientState';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

type ChangePasswordProps = {
  submitUrl: string;
  email: string;
  fieldErrors: FieldError[];
  idapiBaseUrl: string;
};

/* eslint-disable functional/immutable-data */
// explicit use of mutable ref
// useRefState is used to provide access to up-to-date component state inside promises
function useRefState<T>(
  initial: T,
): [T, Dispatch<SetStateAction<T>>, MutableRefObject<T>] {
  const [state, setState] = useState(initial);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  return [state, setState, stateRef];
}
/* eslint-enable functional/immutable-data */

const checkIfBreached = AwesomeDebouncePromise(
  (password: string): Promise<PasswordValidationResult> => {
    const hashedPassword = sha1(password);
    const firstFive = hashedPassword.substr(0, 5);
    const remainingHash = hashedPassword.substr(5, hashedPassword.length);
    return fetch(`https://api.pwnedpasswords.com/range/${firstFive}`)
      .then((r) =>
        r.text().then((results) => {
          if (results.includes(remainingHash.toUpperCase())) {
            return PasswordValidationResult.COMMON_PASSWORD;
          } else {
            return PasswordValidationResult.VALID_PASSWORD;
          }
        }),
      )
      .catch(() => {
        return PasswordValidationResult.VALID_PASSWORD;
      });
  },
  300,
);

const validatePassword = async (
  idapiBaseUrl: string,
  password: string,
): Promise<PasswordValidationResult> => {
  const lengthResult = validatePasswordLength(password);
  if (lengthResult !== PasswordValidationResult.VALID_PASSWORD) {
    return Promise.resolve(lengthResult);
  }

  return checkIfBreached(password);
};

const deriveLengthValidationStyle = (
  validationResult: PasswordValidationResult,
  redError: PasswordValidationResult | undefined,
) => {
  if (validationResult === PasswordValidationResult.VALID_PASSWORD) {
    return ValidationStyling.SUCCESS;
  }
  if (redError !== undefined) {
    return ValidationStyling.ERROR;
  }
  return ValidationStyling.FAILURE;
};

const updateComponentStateAfterValidation = (
  validationResult: PasswordValidationResult,
  password: string,
  passwordCurrently: MutableRefObject<string>,
  setRedError: Dispatch<SetStateAction<ErrorValidationResult | undefined>>,
  redErrorCurrently: MutableRefObject<ErrorValidationResult | undefined>,
  setLastLengthError: Dispatch<SetStateAction<LengthValidationResult>>,
  setValidationResult: Dispatch<SetStateAction<PasswordValidationResult>>,
  isPasswordConfirmSelectedCurrently: MutableRefObject<boolean>,
  passwordConfirmCurrently: MutableRefObject<string>,
) => {
  // return early if the password changed before validation completed
  if (password !== passwordCurrently.current) return;

  // clear the red error if it's solved (common password does not get solved by going beneath 8 characters)
  if (redErrorCurrently.current !== undefined) {
    if (
      validationResult === PasswordValidationResult.VALID_PASSWORD ||
      (redErrorCurrently.current !== PasswordValidationResult.COMMON_PASSWORD &&
        validationResult === PasswordValidationResult.COMMON_PASSWORD)
    ) {
      setRedError(undefined);
    }
  }

  // set red if user has selected the confirm password check box and there are validation issues
  if (
    (isPasswordConfirmSelectedCurrently.current ||
      passwordConfirmCurrently.current.length > 0) &&
    validationResult !== PasswordValidationResult.VALID_PASSWORD
  ) {
    setRedError(validationResult);
  }

  // set the last length error - when the user solves 'at least 8' or 'max 72' we show the length requirement in green
  if (
    validationResult === PasswordValidationResult.AT_LEAST_8 ||
    validationResult === PasswordValidationResult.MAXIMUM_72
  ) {
    setLastLengthError(validationResult);
  }

  setValidationResult(validationResult);
};

// The UX requirements for password validation are subtly complex
// see Reset password flow: https://www.figma.com/file/HrS0AJGKiUzV83dHr1UZP3/Reset-password-screen?node-id=160%3A260
const usePasswordValidationHooks = (idapiBaseUrl: string) => {
  // useRefState makes the up-to-date password accessible in the breachPasswordCheck promise handler
  const [password, setPassword, passwordCurrently] = useRefState('');
  const [passwordConfirm, setPasswordConfirm, passwordConfirmCurrently] =
    useRefState('');

  // if breached password promise completes with errors, and the password confirmation box is selected we show a red error message
  const [, setIsPasswordConfirmSelected, isPasswordConfirmSelectedCurrently] =
    useRefState(false);

  // the latest validation result
  const [validationResult, setValidationResult] =
    useState<PasswordValidationResult>(PasswordValidationResult.AT_LEAST_8);

  // redError is used for the first password input box
  // errors go red color if the user has selected the confirm password input while the password criteria is not satisfied - or if the user submits the form and there are errors present
  // A user has to solve the problem indicated by the red error to make it go away
  // The red error is not necessarily the latest validation result - e.g. common password does not get solved by going beneath 8 characters
  const [redError, setRedError, redErrorCurrently] = useRefState<
    ErrorValidationResult | undefined
  >(undefined);

  // store last length tick/cross error since we want to show it in green after it has been corrected (it can show either password too long, or too short)
  const [lastLengthError, setLastLengthError] =
    useState<LengthValidationResult>(PasswordValidationResult.AT_LEAST_8);

  // Usually we only show password not matching if the confirmed password is not a substring.
  // However, if the user clicks submit we want to show the error message if the password does not equal the confirmed password
  const [
    showPasswordNotMatchingEvenIfSubstring,
    setShowPasswordNotMatchingEvenIfSubstring,
  ] = useState(false);
  // if user solves the matching error we can go back to the 'pre-submit' rule
  if (password === passwordConfirm && showPasswordNotMatchingEvenIfSubstring) {
    setShowPasswordNotMatchingEvenIfSubstring(false);
  }

  useEffect(() => {
    validatePassword(idapiBaseUrl, password).then((validationResult) => {
      updateComponentStateAfterValidation(
        validationResult,
        password,
        passwordCurrently,
        setRedError,
        redErrorCurrently,
        setLastLengthError,
        setValidationResult,
        isPasswordConfirmSelectedCurrently,
        passwordConfirmCurrently,
      );
    });
  }, [password]);

  // this is the style for the length validation check - displayed in green, black or red
  const lengthValidationStyle = deriveLengthValidationStyle(
    validationResult,
    redError,
  );

  const isCommonPassword =
    validationResult === PasswordValidationResult.COMMON_PASSWORD;

  // red error message for first password box
  const longRedErrorMessage =
    redError !== undefined
      ? PasswordValidationLongMessage[redError]
      : undefined;

  // only show password confirm error if other validation checks pass
  const passwordConfirmationErrorMessage =
    validationResult === PasswordValidationResult.VALID_PASSWORD &&
    (!password.startsWith(passwordConfirm) ||
      (showPasswordNotMatchingEvenIfSubstring && password !== passwordConfirm))
      ? ChangePasswordErrors.PASSWORDS_NOT_MATCH
      : undefined;

  const passwordConfirmSuccessMessage =
    validationResult === PasswordValidationResult.VALID_PASSWORD &&
    password === passwordConfirm
      ? ChangePasswordErrors.PASSWORDS_MATCH
      : undefined;

  return {
    password,
    passwordConfirm,
    setPassword,
    setPasswordConfirm,
    isCommonPassword,
    lastLengthError,
    lengthValidationStyle,
    passwordConfirmSuccessMessage,
    passwordConfirmationErrorMessage,
    longRedErrorMessage,
    setRedError,
    setIsPasswordConfirmSelected,
    validationResult,
    setShowPasswordNotMatchingEvenIfSubstring,
  };
};

export const ChangePassword = ({
  submitUrl,
  email,
  fieldErrors,
  idapiBaseUrl,
}: ChangePasswordProps) => {
  const {
    password,
    passwordConfirm,
    setPassword,
    setPasswordConfirm,
    isCommonPassword,
    lastLengthError,
    lengthValidationStyle,
    passwordConfirmSuccessMessage,
    passwordConfirmationErrorMessage,
    longRedErrorMessage,
    setRedError,
    setIsPasswordConfirmSelected,
    validationResult,
    setShowPasswordNotMatchingEvenIfSubstring,
  } = usePasswordValidationHooks(idapiBaseUrl);

  return (
    <>
      <Header />
      <Main subTitle="Sign in">
        <PageBox>
          <PageHeader>Reset Password</PageHeader>
          <PageBody>
            <PageBodyText>
              Please enter your new password for {email}
            </PageBodyText>
            <form
              css={form}
              method="post"
              action={submitUrl}
              onSubmit={(e) => {
                // prevent the form from submitting if there are validation errors
                if (
                  validationResult !== PasswordValidationResult.VALID_PASSWORD
                ) {
                  setRedError(validationResult);
                  e.preventDefault();
                } else if (password !== passwordConfirm) {
                  setShowPasswordNotMatchingEvenIfSubstring(true);
                  e.preventDefault();
                }
              }}
            >
              <CsrfFormField />

              <PasswordInput
                label="New Password"
                name="password"
                error={
                  longRedErrorMessage ??
                  fieldErrors.find(
                    (fieldError) => fieldError.field === 'password',
                  )?.message
                }
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />

              <div
                css={css`
                  margin-bottom: ${space[9]}px;
                `}
              >
                {/* we don't render length validation success output if the password is breached */}
                {!isCommonPassword ? (
                  <PasswordLengthMessage
                    validationStyling={lengthValidationStyle}
                    lengthResult={lastLengthError}
                  />
                ) : null}
                {isCommonPassword ? <PasswordWeakMessage /> : null}
              </div>

              <PasswordInput
                label="Repeat Password"
                name="password_confirm"
                success={passwordConfirmSuccessMessage}
                error={
                  passwordConfirmationErrorMessage ??
                  fieldErrors.find(
                    (fieldError) => fieldError.field === 'password_confirm',
                  )?.message
                }
                onFocus={() => {
                  setIsPasswordConfirmSelected(true);
                  // if there are validation issues in the first password input and the user selects the confirm password box,
                  // display a red error message
                  if (
                    longRedErrorMessage === undefined &&
                    validationResult !== PasswordValidationResult.VALID_PASSWORD
                  ) {
                    setRedError(validationResult);
                  }
                }}
                onBlur={() => {
                  setIsPasswordConfirmSelected(false);
                }}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                }}
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
      </Main>
      <Footer />
    </>
  );
};
