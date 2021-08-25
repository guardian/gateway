import { TextInput } from '@guardian/src-text-input';
import React, { useContext, useState } from 'react';
import { css } from '@emotion/react';
import { SvgEye, SvgEyeStrike } from '@guardian/src-icons';
import { textInputDefault } from '@guardian/src-foundations/themes';
import { space } from '@guardian/src-foundations';
import { height } from '@guardian/src-foundations/size';
import { textInput } from '@/client/styles/Shared';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';

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

const textInputBorderStyle = (error?: string) => css`
  border: ${error
    ? `4px solid ${textInputDefault.textInput.textError}`
    : `2px solid ${textInputDefault.textInput.border}`};
  position: absolute;
  bottom: 0px;
  width: 100%;
  height: ${height.inputMedium}px;
  margin-bottom: ${space[3]}px;
  padding: 0 ${space[2]}px;
  pointer-events: none;
`;

// remove the border and shorten the width of the text input box so the text does not overlap the password eye
const paddingRight = (isEyeDisplayedOnBrowser: boolean) => css`
  padding-right: ${isEyeDisplayedOnBrowser ? 28 : 0}px;
`;

// we render our own border which includes the input field and eye symbol
const noBorder = css`
  border: none;
  :active {
    border: none;
  }
`;

const EyeIcon = ({ isOpen }: { isOpen: boolean }) => {
  const iconStyles = css`
    position: absolute;
    top: 0;
    left: 0;
    svg {
      width: 30px;
      height: 30px;
    }
  `;

  if (isOpen)
    return (
      <div css={iconStyles}>
        <SvgEyeStrike />
      </div>
    );
  return (
    <div css={iconStyles}>
      <SvgEye />
    </div>
  );
};

const EyeSymbol = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const buttonStyles = css`
    width: 30px;
    height: 30px;
    position: absolute;
    right: 5px;
    bottom: 19px;
    border: none;
    background-color: transparent;
    cursor: pointer;
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
        position: relative;
      `}
    >
      <TextInput
        error={error}
        onChange={onChange}
        label={label}
        name="password"
        supporting={supporting}
        css={textInput}
        type={passwordVisible ? 'text' : 'password'}
        cssOverrides={[noBorder, paddingRight(isEyeDisplayedOnBrowser)]}
      />
      {isEyeDisplayedOnBrowser ? (
        <EyeSymbol
          isOpen={!passwordVisible}
          onClick={() => {
            // Toggle viewability of password
            setPasswordVisible((previousState) => !previousState);
          }}
        />
      ) : null}

      {/* This div is used to show a border around the text input and password eye.
       Text input is slightly narrower so text does not overlap the show / close eye */}
      <div css={textInputBorderStyle(error)} />
    </div>
  );
};
