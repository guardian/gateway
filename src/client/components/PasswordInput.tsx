import { TextInput, Width } from '@guardian/src-text-input';
import React, { InputHTMLAttributes, useContext, useState } from 'react';
import { Props } from '@guardian/src-helpers';
import { css } from '@emotion/react';
import { SvgEye, SvgEyeStrike } from '@guardian/src-icons';
import { textInputDefault } from '@guardian/src-foundations/themes';
import { space } from '@guardian/src-foundations';
import { height } from '@guardian/src-foundations/size';
import { ClientState } from '@/shared/model/ClientState';
import { ClientStateContext } from '@/client/components/ClientState';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement>, Props {
  label: string;
  supporting?: string;
  width?: Width;
  error?: string;
  success?: string;
}

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
  visible,
  isOpen,
  onClick,
}: {
  visible: boolean;
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
      {visible ? (
        <div className={'password-input-eye-symbol'} css={style}>
          {symbol}
        </div>
      ) : null}
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

export const PasswordInput = (props: TextInputProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [eyeVisible, setEyeVisible] = useState(false);
  const { pageData: { browserName } = {} }: ClientState = useContext(
    ClientStateContext,
  );

  const isEyeDisplayedOnBrowser = isDisplayEyeOnBrowser(browserName);
  const spaceForEye = isEyeDisplayedOnBrowser ? 28 : 0;

  // remove the border and shorten the width of the text input box so the text does not overlap the password eye
  // we render our own border which includes the input field and eye symbol
  const textInputStyle = css`
    border: none;
    :active {
      border: none;
    }
    width: calc(100% - ${spaceForEye}px);
  `;

  const borderStyle = props.success
    ? `4px solid ${textInputDefault.textInput.textSuccess}`
    : props.error
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
      tabIndex={
        -1 /* Tab index -1 is necessary to get focus events for the child elements (the input and password eye) */
      }
      onFocus={() => {
        // show / hide the eye depending on whether the input field (including the eye itself) is selected
        setEyeVisible(true);
      }}
      onBlur={() => {
        setEyeVisible(false);
      }}
    >
      {isEyeDisplayedOnBrowser ? (
        <EyeSymbol
          isOpen={!passwordVisible}
          visible={eyeVisible}
          onClick={() => setPasswordVisible((prev) => !prev)}
        />
      ) : null}
      <TextInput
        {...props}
        type={passwordVisible ? 'text' : 'password'}
        cssOverrides={textInputStyle}
      />

      {/* This div is used to show a border around the text input and password eye.
       Text input is slightly narrower so text does not overlap the show / close eye */}
      <div css={textInputBorderStyle} />
    </div>
  );
};
