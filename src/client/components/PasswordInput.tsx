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
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

const EyeSymbol = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  const style = css`
    width: 30px;
    height: 30px;
    position: absolute;
    right: 5px;
    bottom: 19px;
  `;

  const EyeIcon = ({ isOpen }: { isOpen: boolean }) => {
    return isOpen ? <SvgEye /> : <SvgEyeStrike />;
  };

  return (
    <button
      css={style}
      onClick={onClick}
      onKeyDown={onClick}
      title="show or hide password text"
      className={'password-input-eye-button'}
    >
      <EyeIcon isOpen={isOpen} />
    </button>
  );
};

export const PasswordInput = ({ error, onChange }: Props) => {
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
        label="New Password"
        name="password"
        supporting="Must be between 8 and 72 characters"
        css={textInput}
        type={passwordVisible ? 'text' : 'password'}
        cssOverrides={[noBorder, paddingRight(isEyeDisplayedOnBrowser)]}
      />
      {isEyeDisplayedOnBrowser ? (
        <EyeSymbol
          isOpen={!passwordVisible}
          onClick={() => setPasswordVisible((prev) => !prev)}
        />
      ) : null}

      {/* This div is used to show a border around the text input and password eye.
       Text input is slightly narrower so text does not overlap the show / close eye */}
      <div css={textInputBorderStyle(error)} />
    </div>
  );
};
