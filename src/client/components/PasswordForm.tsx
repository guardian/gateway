import React, { useEffect, useState } from 'react';
import { Button } from '@guardian/src-button';
import {
  SvgCross,
  SvgAlertTriangle,
  SvgCheckmark,
  SvgArrowRightStraight,
} from '@guardian/src-icons';
import { success, error, neutral } from '@guardian/src-foundations/palette';
import { textSans } from '@guardian/src-foundations/typography';
import { button, form } from '@/client/styles/Shared';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { space } from '@guardian/src-foundations';
import { css } from '@emotion/react';

import sha1 from 'js-sha1';
import { PasswordInput } from '@/client/components/PasswordInput';
import { FieldError } from '@/shared/model/ClientState';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { AutoRow, passwordFormSpanDef } from '@/client/styles/Grid';

type Props = {
  submitUrl: string;
  fieldErrors: FieldError[];
  submitButtonText: string;
  // for grid layout on consents page
  gridAutoRow?: AutoRow;
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
  margin-bottom: ${space[3]}px;
`;

const TooLong = () => {
  return (
    <div css={messageWrapperStyles}>
      <div css={[baseIconStyles, failureIconStyles]}>
        <SvgCross />
      </div>
      <div css={baseMessageStyles}>{ChangePasswordErrors.MAXIMUM_72_SHORT}</div>
    </div>
  );
};

const TooShort = () => {
  return (
    <div css={messageWrapperStyles}>
      <div css={[baseIconStyles, failureIconStyles]}>
        <SvgCross />
      </div>
      <div css={baseMessageStyles}>{ChangePasswordErrors.AT_LEAST_8_SHORT}</div>
    </div>
  );
};

const Valid = () => {
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
    <div css={messageWrapperStyles}>
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

const Checking = () => {
  return (
    <div css={messageWrapperStyles}>
      <div css={baseMessageStyles}>Checking...</div>
    </div>
  );
};

const Weak = () => {
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
    <div css={[messageWrapperStyles, baseMessageStyles]}>
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
}: {
  isWeak: boolean;
  isTooShort: boolean;
  isTooLong: boolean;
  isChecking: boolean;
}) => {
  if (isTooShort) {
    return <TooShort />;
  } else if (isTooLong) {
    return <TooLong />;
  } else if (isChecking) {
    return <Checking />;
  } else if (isWeak) {
    return <Weak />;
  } else {
    return <Valid />;
  }
};

const isBreached = AwesomeDebouncePromise(
  (password: string): Promise<boolean> => {
    const hashedPassword = sha1(password);
    const firstFive = hashedPassword.substr(0, 5);
    const remainingHash = hashedPassword.substr(5, hashedPassword.length);
    return fetch(`https://api.pwnedpasswords.com/range/${firstFive}`)
      .then((r) =>
        r.text().then((results) => {
          if (results.includes(remainingHash.toUpperCase())) {
            return true;
          } else {
            return false;
          }
        }),
      )
      .catch(() => {
        return false;
      });
  },
  300,
);

export const PasswordForm = ({
  submitUrl,
  fieldErrors,
  submitButtonText,
  gridAutoRow,
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
      isBreached(password)
        .then((breached) => {
          if (breached) {
            // Password is breached ❌
            setIsWeak(true);
          } else {
            // Password is valid ✔
            setIsWeak(false);
          }
        })
        .finally(() => setIsChecking(false));
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
    >
      <CsrfFormField />

      <PasswordInput
        error={error}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />

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
