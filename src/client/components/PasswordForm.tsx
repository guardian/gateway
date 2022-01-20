import React, { ReactNode, useEffect, useState } from 'react';
import {
  Button,
  SvgCross,
  SvgAlertTriangle,
  SvgCheckmark,
  SvgArrowRightStraight,
} from '@guardian/source-react-components';
import {
  success,
  error,
  neutral,
  textSans,
  space,
} from '@guardian/source-foundations';
import { button } from '@/client/styles/Shared';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { css } from '@emotion/react';

import sha1 from 'js-sha1';
import {
  PasswordAutoComplete,
  PasswordInput,
} from '@/client/components/PasswordInput';
import { FieldError } from '@/shared/model/ClientState';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { AutoRow, passwordFormSpanDef } from '@/client/styles/Grid';
import { MainForm } from '@/client/components/MainForm';
import { trackFormFocusBlur, trackFormSubmit } from '@/client/lib/ophan';
import { logger } from '../lib/clientSideLogger';

type Props = {
  submitUrl: string;
  fieldErrors: FieldError[];
  submitButtonText: string;
  labelText: string;
  // for grid layout on consents page
  gridAutoRow?: AutoRow;
  recaptchaSiteKey?: string;
  setRecaptchaErrorMessage?: React.Dispatch<React.SetStateAction<string>>;
  setRecaptchaErrorContext?: React.Dispatch<React.SetStateAction<ReactNode>>;
  autoComplete?: PasswordAutoComplete;
  formTrackingName?: string;
};

const baseIconStyles = css`
  display: inline-block;
  position: relative;
  top: 3px;
  svg {
    height: 18px;
    width: 18px;
  }
`;

const baseMessageStyles = css`
  ${textSans.small()};
  margin-left: 3px;
  display: inline-block;
  color: ${neutral[46]};
`;

const failureIconStyles = css`
  svg {
    background: ${neutral[46]};
    fill: ${neutral[100]};
    height: 17px;
    width: 17px;
    border-radius: 50%;
  }
`;

const messageWrapperStyles = css`
  margin-bottom: ${space[6]}px;
`;

const form = css`
  padding-top: ${space[3]}px;
`;

const passwordInput = css`
  margin-bottom: ${space[2]}px;
`;

const TooLong = ({ noMargin = false }) => {
  return (
    <div css={noMargin ? undefined : messageWrapperStyles}>
      <div css={[baseIconStyles, failureIconStyles]}>
        <SvgCross />
      </div>
      <div css={baseMessageStyles}>{ChangePasswordErrors.MAXIMUM_72_SHORT}</div>
    </div>
  );
};

const TooShort = ({ noMargin = false }) => {
  return (
    <div css={noMargin ? undefined : messageWrapperStyles}>
      <div css={[baseIconStyles, failureIconStyles]}>
        <SvgCross />
      </div>
      <div css={baseMessageStyles}>{ChangePasswordErrors.AT_LEAST_8_SHORT}</div>
    </div>
  );
};

const Valid = ({ noMargin = false }) => {
  const successIconStyles = css`
    svg {
      background: ${success[400]};
      fill: ${neutral[100]};
      height: 17px;
      width: 17px;
      border-radius: 50%;
    }
  `;

  return (
    <div css={noMargin ? undefined : messageWrapperStyles}>
      <div css={[baseIconStyles, successIconStyles]}>
        <SvgCheckmark />
      </div>
      <div
        css={[
          baseMessageStyles,
          css`
            font-weight: bold;
            color: ${success[400]};
          `,
        ]}
      >
        Valid password
      </div>
    </div>
  );
};

const Checking = ({ noMargin = false }) => {
  return (
    <div css={noMargin ? undefined : messageWrapperStyles}>
      <div css={baseMessageStyles}>Checking...</div>
    </div>
  );
};

const Weak = ({ noMargin = false }) => {
  const errorIconStyles = css`
    svg {
      fill: ${error['400']};
      height: 24px;
      width: 24px;
      margin-bottom: -4px;
      margin-top: -4px;
      margin-left: -4px;
    }
  `;

  const redText = css`
    color: ${error[400]};
    font-weight: bold;
  `;

  return (
    <div css={[noMargin ? undefined : messageWrapperStyles, baseMessageStyles]}>
      <div css={[baseIconStyles, errorIconStyles]}>
        <SvgAlertTriangle />
      </div>
      <span css={redText}>Weak password:</span>{' '}
      {ChangePasswordErrors.COMMON_PASSWORD_SHORT}
    </div>
  );
};

const ValidationMessage = ({
  isWeak,
  isTooShort,
  isTooLong,
  isChecking,
  noMargin,
}: {
  isWeak: boolean;
  isTooShort: boolean;
  isTooLong: boolean;
  isChecking: boolean;
  noMargin?: boolean;
}) => {
  if (isTooShort) {
    return <TooShort noMargin={noMargin} />;
  } else if (isTooLong) {
    return <TooLong noMargin={noMargin} />;
  } else if (isChecking) {
    return <Checking noMargin={noMargin} />;
  } else if (isWeak) {
    return <Weak noMargin={noMargin} />;
  } else {
    return <Valid noMargin={noMargin} />;
  }
};

const isBreached = AwesomeDebouncePromise(
  async (password: string): Promise<boolean> => {
    try {
      const hashedPassword = sha1(password);
      const firstFive = hashedPassword.substr(0, 5);
      const remainingHash = hashedPassword.substr(5, hashedPassword.length);

      const response = await fetch(
        `https://api.pwnedpasswords.com/range/${firstFive}`,
      );

      if (response.ok) {
        const text = await response.text();

        if (text.includes(remainingHash.toUpperCase())) {
          return true;
        }
      } else {
        logger.warn(
          'breach password check failed with status',
          response.status,
        );
      }

      // return false as the password is not breached or a fallback in case the api is down
      return false;
    } catch (error) {
      logger.warn('breach password check failed with error', error);
      return false;
    }
  },
  300,
);

export const PasswordForm = ({
  submitUrl,
  fieldErrors,
  submitButtonText,
  labelText,
  gridAutoRow,
  autoComplete,
  formTrackingName,
}: Props) => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | undefined>(
    fieldErrors.find((fieldError) => fieldError.field === 'password')?.message,
  );
  const [isWeak, setIsWeak] = useState<boolean>(false);
  const [isTooShort, setIsTooShort] = useState<boolean>(true);
  const [isTooLong, setIsTooLong] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    // Typing anything clears the big red error, falling back to the dynamic validation message
    if (password.length > 0) setError(undefined);
    setIsTooShort(password.length < 8);
    setIsTooLong(password.length > 72);

    if (password.length >= 8 && password.length <= 72) {
      // Only make api calls to check if breached when length rules are not broken
      setIsChecking(true);
      isBreached(password).then((breached) => {
        if (breached) {
          // Password is breached ❌
          setIsWeak(true);
        } else {
          // Password is valid ✔
          setIsWeak(false);
        }
        setIsChecking(false);
      });
    } else {
      // Password is not an acceptable length ❌
      setIsWeak(false);
    }
  }, [password]);

  return (
    <form
      css={[form, gridAutoRow && gridAutoRow(passwordFormSpanDef)]}
      method="post"
      action={submitUrl}
      onSubmit={(e) => {
        if (formTrackingName) {
          trackFormSubmit(formTrackingName);
        }
        if (isTooShort) {
          setError(ChangePasswordErrors.AT_LEAST_8);
          e.preventDefault();
        } else if (isTooLong) {
          setError(ChangePasswordErrors.MAXIMUM_72);
          e.preventDefault();
        } else if (isWeak) {
          setError(ChangePasswordErrors.COMMON_PASSWORD);
          e.preventDefault();
        }
      }}
      onFocus={(e) =>
        formTrackingName && trackFormFocusBlur(formTrackingName, e, 'focus')
      }
      onBlur={(e) =>
        formTrackingName && trackFormFocusBlur(formTrackingName, e, 'blur')
      }
    >
      <CsrfFormField />
      <div css={passwordInput}>
        <PasswordInput
          displayEye={true}
          error={error}
          label={labelText}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          autoComplete={autoComplete}
        />
      </div>
      {!error && (
        <ValidationMessage
          isWeak={isWeak}
          isTooShort={isTooShort}
          isTooLong={isTooLong}
          isChecking={isChecking}
        />
      )}

      <Button
        css={button}
        type="submit"
        icon={<SvgArrowRightStraight />}
        iconSide="right"
        data-cy="change-password-button"
      >
        {submitButtonText}
      </Button>
    </form>
  );
};

// this is mostly duplicated from the form above, as the above form is still
// being used on the welcome/onboarding page until that is redesigned
// so we created this new component to use with the `MainLayout` for the time being
export const PasswordFormMainLayout = ({
  submitUrl,
  fieldErrors,
  submitButtonText,
  labelText,
  recaptchaSiteKey,
  setRecaptchaErrorMessage,
  setRecaptchaErrorContext,
  autoComplete,
  formTrackingName,
}: Props) => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | undefined>(
    fieldErrors.find((fieldError) => fieldError.field === 'password')?.message,
  );
  const [isWeak, setIsWeak] = useState<boolean>(false);
  const [isTooShort, setIsTooShort] = useState<boolean>(true);
  const [isTooLong, setIsTooLong] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    // Typing anything clears the big red error, falling back to the dynamic validation message
    if (password.length > 0) setError(undefined);
    setIsTooShort(password.length < 8);
    setIsTooLong(password.length > 72);

    if (password.length >= 8 && password.length <= 72) {
      // Only make api calls to check if breached when length rules are not broken
      setIsChecking(true);
      isBreached(password).then((breached) => {
        if (breached) {
          // Password is breached ❌
          setIsWeak(true);
        } else {
          // Password is valid ✔
          setIsWeak(false);
        }
        setIsChecking(false);
      });
    } else {
      // Password is not an acceptable length ❌
      setIsWeak(false);
    }
  }, [password]);

  return (
    <MainForm
      formAction={submitUrl}
      submitButtonText={submitButtonText}
      onSubmitOverride={(e) => {
        if (isTooShort) {
          setError(ChangePasswordErrors.AT_LEAST_8);
          e.preventDefault();
        } else if (isTooLong) {
          setError(ChangePasswordErrors.MAXIMUM_72);
          e.preventDefault();
        } else if (isWeak) {
          setError(ChangePasswordErrors.COMMON_PASSWORD);
          e.preventDefault();
        }
      }}
      recaptchaSiteKey={recaptchaSiteKey}
      setRecaptchaErrorMessage={setRecaptchaErrorMessage}
      setRecaptchaErrorContext={setRecaptchaErrorContext}
      formTrackingName={formTrackingName}
    >
      <div css={error ? undefined : passwordInput}>
        <PasswordInput
          error={error}
          label={labelText}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          displayEye={true}
          autoComplete={autoComplete}
        />
      </div>
      {!error && (
        <ValidationMessage
          isWeak={isWeak}
          isTooShort={isTooShort}
          isTooLong={isTooLong}
          isChecking={isChecking}
          noMargin
        />
      )}
    </MainForm>
  );
};
