import React, { useEffect, useState } from 'react';
import { Button } from '@guardian/src-button';
import { SvgArrowRightStraight } from '@guardian/src-icons';
import { SvgCheckmark } from '@guardian/src-icons';
import { SvgCross } from '@guardian/src-icons';
import { palette } from '@guardian/src-foundations';
import { textSans } from '@guardian/src-foundations/typography';
import { PageBox } from '@/client/components/PageBox';
import { PageHeader } from '@/client/components/PageHeader';
import { PageBody } from '@/client/components/PageBody';
import { PageBodyText } from '@/client/components/PageBodyText';
import { button, form } from '@/client/styles/Shared';
import { Main } from '@/client/layouts/Main';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import { CsrfFormField } from '@/client/components/CsrfFormField';
import { space } from '@guardian/src-foundations';
import { css } from '@emotion/react';

import sha1 from 'js-sha1';
import { PasswordInput } from '@/client/components/PasswordInput';
import { FieldError } from '@/shared/model/ClientState';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

type ChangePasswordProps = {
  submitUrl: string;
  email: string;
  fieldErrors: FieldError[];
};

enum Validation {
  SUCCESS,
  FAILURE,
  ERROR,
}

const ValidationSymbol = ({ result }: { result: Validation }) => {
  const baseStyles = css`
    display: inline-block;
    position: relative;
    top: 3px;
    svg {
      width: 16px;
      height: 16px;
    }
  `;

  const successStyles = css`
    svg {
      color: ${palette.success['400']};
    }
  `;

  const errorStyles = css`
    svg {
      color: ${palette.error['400']};
    }
  `;

  const failureStyles = css`
    svg {
      color: ${palette.neutral['7']};
    }
  `;

  switch (result) {
    case Validation.SUCCESS: {
      return (
        <div css={[baseStyles, successStyles]}>
          <SvgCheckmark />
        </div>
      );
    }
    case Validation.ERROR: {
      return (
        <div css={[baseStyles, errorStyles]}>
          <SvgCross />
        </div>
      );
    }
    case Validation.FAILURE:
    default: {
      return (
        <div css={[baseStyles, failureStyles]}>
          <SvgCross />
        </div>
      );
    }
  }
};

const baseMessageStyles = css`
  ${textSans.small()}
  margin-bottom: 4px;
  margin-left: 3px;
  display: inline-block;
`;

const validationStyles = (result: Validation) => {
  let color = palette.neutral['7'];

  if (result === Validation.SUCCESS) {
    color = palette.success['400'];
  } else if (result === Validation.ERROR) {
    color = palette.error['400'];
  }

  return css`
    ${textSans.small()}
    margin-bottom: 4px;
    margin-left: 3px;
    display: inline-block;
    color: ${color};
  `;
};

const TooLong = ({ error }: { error?: string }) => {
  return (
    <div>
      <ValidationSymbol
        result={error ? Validation.ERROR : Validation.FAILURE}
      />
      <div
        css={[
          baseMessageStyles,
          error
            ? css`
                color: ${palette.error['400']};
              `
            : css`
                color: ${palette.neutral['7']};
              `,
        ]}
      >
        {ChangePasswordErrors.MAXIMUM_72_SHORT}
      </div>
    </div>
  );
};

const TooShort = ({ error }: { error?: string }) => {
  return (
    <div>
      <ValidationSymbol
        result={error ? Validation.ERROR : Validation.FAILURE}
      />
      <div
        css={[
          baseMessageStyles,
          error
            ? css`
                color: ${palette.error['400']};
              `
            : css`
                color: ${palette.neutral['7']};
              `,
        ]}
      >
        {ChangePasswordErrors.AT_LEAST_8_SHORT}
      </div>
    </div>
  );
};

const Valid = () => {
  return (
    <div>
      <ValidationSymbol result={Validation.SUCCESS} />
      <div css={validationStyles(Validation.SUCCESS)}>Success</div>
    </div>
  );
};

const Checking = () => {
  return (
    <div>
      <div css={validationStyles(Validation.FAILURE)}>Checking...</div>
    </div>
  );
};

const Weak = () => {
  const smallFont = css`
    ${textSans.small()}
    color: ${palette.neutral['7']};
  `;

  const redText = css`
    color: ${palette.error['400']};
  `;

  return (
    <div css={smallFont}>
      <span css={redText}>Weak password:</span>{' '}
      {ChangePasswordErrors.COMMON_PASSWORD_SHORT}
    </div>
  );
};

const ValidationMessage = ({
  error,
  isWeak,
  isTooShort,
  isTooLong,
  isValid,
}: {
  error?: string;
  isWeak: boolean;
  isTooShort: boolean;
  isTooLong: boolean;
  isValid: boolean;
}) => {
  if (isValid) {
    return <Valid />;
  } else if (isTooShort) {
    return <TooShort error={error} />;
  } else if (isTooLong) {
    return <TooLong error={error} />;
  } else if (isWeak) {
    return <Weak />;
  } else {
    return <Checking />;
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

export const ChangePassword = ({
  submitUrl,
  email,
  fieldErrors,
}: ChangePasswordProps) => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | undefined>(
    fieldErrors.find((fieldError) => fieldError.field === 'password')?.message,
  );
  const [isWeak, setIsWeak] = useState<boolean>(false);
  const [isTooShort, setIsTooShort] = useState<boolean>(true);
  const [isTooLong, setIsTooLong] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    // Typing anything clears the big red error, falling back to the dynamic validation message
    setError(undefined);
    setIsTooShort(password.length < 8);
    setIsTooLong(password.length > 72);

    if (password.length >= 8 && password.length <= 72) {
      // Only make api calls to check if breached when length rules are not broken
      isBreached(password).then((breached) => {
        if (breached) {
          setIsWeak(true);
          // Password is breached so not valid ❌
          setIsValid(false);
        } else {
          setIsWeak(false);
          // Password is not breached and is an acceptable length so it is valid ✔
          setIsValid(true);
        }
      });
    } else {
      setIsWeak(false);
      // Password is not an acceptable length so not valid ❌
      setIsValid(false);
    }
  }, [password]);

  return (
    <>
      <Header />
      <Main subTitle="Sign in">
        <PageBox>
          <PageHeader>Set Password</PageHeader>
          <PageBody>
            <PageBodyText>
              Please enter your new password for {email}
            </PageBodyText>
            <form
              css={form}
              method="post"
              action={submitUrl}
              onSubmit={(e) => {
                if (isTooLong || isTooShort) {
                  setError(ChangePasswordErrors.AT_LEAST_8_SHORT);
                } else if (isWeak) {
                  setError(ChangePasswordErrors.COMMON_PASSWORD_SHORT);
                }
                // prevent the form from submitting if there are validation errors
                if (!isValid) {
                  e.preventDefault();
                }
              }}
            >
              <CsrfFormField />

              <PasswordInput
                label="New Password"
                name="password"
                error={error}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />

              <div
                css={css`
                  margin-bottom: ${space[9]}px;
                `}
              >
                <ValidationMessage
                  error={error}
                  isWeak={isWeak}
                  isTooShort={isTooShort}
                  isTooLong={isTooLong}
                  isValid={isValid}
                />
              </div>

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
