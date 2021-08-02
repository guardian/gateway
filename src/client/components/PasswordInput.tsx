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

const EyeSymbol = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  const symbol = isOpen ? <SvgEye /> : <SvgEyeStrike />;
  const style = css`
    width: 30px;
    height: 30px;
    position: absolute;
    right: 5px;
    bottom: 19px;
    :focus {
      outline: none;
    }
  `;

  // we have to separate the click div from the symbol div, otherwise the user has to click the icon twice:
  // once to get focus, the other to trigger the onClick event
  //
  // This has something to do with onFocus and onBlur events combined with re-renders on state changes preventing
  // the first click being handled by the onClick handler
  return (
    <>
      <div className={'password-input-eye-symbol'} css={style}>
        {symbol}
      </div>
      <div
        role="button"
        css={style}
        onClick={onClick}
        onKeyDown={onClick}
        tabIndex={0}
        title="show or hide password text"
        className={'password-input-eye-button'}
      />
    </>
  );
};

export const PasswordInput = ({ error, onChange }: Props) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { pageData: { browserName } = {} }: ClientState =
    useContext(ClientStateContext);

  const isEyeDisplayedOnBrowser = isDisplayEyeOnBrowser(browserName);
  const spaceForEye = isEyeDisplayedOnBrowser ? 28 : 0;

  // remove the border and shorten the width of the text input box so the text does not overlap the password eye
  // we render our own border which includes the input field and eye symbol
  const textInputStyle = css`
    border: none;
    :active {
      border: none;
    }
    padding-right: ${spaceForEye}px;
  `;

  const borderStyle = error
    ? `4px solid ${textInputDefault.textInput.textError}`
    : `2px solid ${textInputDefault.textInput.border}`;

  const textInputBorderStyle = css`
    border: ${borderStyle};
    position: absolute;
    bottom: 0px;
    width: 100%;
    height: ${height.inputMedium}px;
    margin-bottom: ${space[3]}px;
    padding: 0 ${space[2]}px;
    pointer-events: none;
  `;

  return (
    <div
      css={css`
        position: relative;
        :focus {
          outline: none;
        }
      `}
    >
      {isEyeDisplayedOnBrowser ? (
        <EyeSymbol
          isOpen={!passwordVisible}
          onClick={() => setPasswordVisible((prev) => !prev)}
        />
      ) : null}
      <TextInput
        error={error}
        onChange={onChange}
        label="New Password"
        name="password"
        supporting="Must be between 8 and 72 characters"
        css={textInput}
        type={passwordVisible ? 'text' : 'password'}
        cssOverrides={textInputStyle}
      />

      {/* This div is used to show a border around the text input and password eye.
       Text input is slightly narrower so text does not overlap the show / close eye */}
      <div css={textInputBorderStyle} />
    </div>
  );
};
