import {
  SvgEye,
  SvgEyeStrike,
  TextInput,
  textInputThemeDefault,
} from '@guardian/source-react-components';
import React, { useContext, useState } from 'react';
import { css } from '@emotion/react';
import { neutral, height } from '@guardian/source-foundations';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';
import { disableAutofillBackground } from '@/client/styles/Shared';

type Props = {
  label: string;
  error?: string;
  supporting?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const isDisplayEyeOnBrowser = (browserName: string | undefined) => {
  // These browsers already have an input box overlay where the eye is positioned
  switch (browserName) {
    case 'Microsoft Edge':
    case 'Internet Explorer':
    case 'Safari':
      return false;
    default:
      return true;
  }
};

// remove the border and shorten the width of the text input box so the text does not overlap the password eye
const paddingRight = (isEyeDisplayedOnBrowser: boolean) => css`
  padding-right: ${isEyeDisplayedOnBrowser ? 28 : 0}px;
`;

// we render our own border which includes the input field and eye symbol
const noBorder = css`
  border-right: none;
  :active {
    border-right: none;
  }
`;

const EyeIcon = ({ isOpen }: { isOpen: boolean }) => {
  const iconStyles = css`
    svg {
      width: 30px;
      height: 30px;
      fill: ${neutral[60]};
    }
  `;

  // isOpen corresponds to when the password is visible
  // so we want to show show the SvgEyeStrike to make it
  // clear to the user that clicking this icon will make
  // the password hidden
  if (isOpen) {
    return (
      <div css={iconStyles}>
        <SvgEyeStrike />
      </div>
    );
  } else {
    // otherwise we show the SvgEye when the password is
    // hidden to make it clear to the user that clicking
    // this icon will make the password visible
    return (
      <div css={iconStyles}>
        <SvgEye />
      </div>
    );
  }
};

const EyeSymbol = ({
  isOpen,
  onClick,
  error,
}: {
  isOpen: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  error?: string;
}) => {
  const buttonStyles = css`
    border: ${error
      ? `4px solid ${textInputThemeDefault.textInput.borderError}`
      : `2px solid ${textInputThemeDefault.textInput.border}`};
    border-left: none;
    background-color: transparent;
    cursor: pointer;
    height: ${height.inputMedium}px;
    align-self: flex-end;
  `;

  return (
    <button
      type="button"
      css={buttonStyles}
      onClick={onClick}
      title="show or hide password text"
      data-cy="password-input-eye-button"
      aria-label="Show password"
    >
      <EyeIcon isOpen={isOpen} />
    </button>
  );
};

export const PasswordInput = ({
  label,
  error,
  supporting,
  onChange,
}: Props) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { pageData: { browserName } = {} }: ClientState =
    useContext(ClientStateContext);

  const isEyeDisplayedOnBrowser = isDisplayEyeOnBrowser(browserName);

  return (
    <div
      css={css`
        display: flex;
      `}
    >
      <div
        css={[
          css`
            flex: 1;
          `,
        ]}
      >
        <TextInput
          error={error}
          onChange={onChange}
          label={label}
          name="password"
          supporting={supporting}
          type={passwordVisible ? 'text' : 'password'}
          cssOverrides={[
            noBorder,
            paddingRight(isEyeDisplayedOnBrowser),
            disableAutofillBackground,
          ]}
        />
      </div>
      {isEyeDisplayedOnBrowser ? (
        <EyeSymbol
          error={error}
          isOpen={passwordVisible}
          onClick={() => {
            // Toggle visibility of password
            setPasswordVisible((previousState) => !previousState);
          }}
        />
      ) : null}
    </div>
  );
};
