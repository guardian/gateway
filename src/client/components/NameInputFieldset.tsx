import { css } from '@emotion/react';
import { space, textSans } from '@guardian/source-foundations';
import { TextInput } from '@guardian/source-react-components';
import React from 'react';
import {
  InputFieldState,
  useInputValidityState,
} from '../lib/hooks/useInputValidityState';

const fieldSpacing = css`
  margin-bottom: ${space[2]}px;
`;

const fieldset = css`
  border: 0;
  padding: 0;
  margin: ${space[4]}px 0 0 0;
  ${textSans.medium()}
`;

const FirstNameInput = () => {
  const { onBlur, inputFieldState, onInput, onInvalid } =
    useInputValidityState();

  const isEmpty = inputFieldState === InputFieldState.EMPTY;
  const errorMessage = isEmpty ? 'Please enter your First name' : undefined;

  return (
    <TextInput
      required
      label={'First Name'}
      name="first-name"
      type="text"
      autoComplete="given-name"
      css={fieldSpacing}
      onBlur={onBlur}
      onInput={onInput}
      onInvalid={onInvalid}
      error={errorMessage}
    />
  );
};

const LastNameInput = () => {
  const { onBlur, inputFieldState, onInput, onInvalid } =
    useInputValidityState();

  const isEmpty = inputFieldState === InputFieldState.EMPTY;
  const errorMessage = isEmpty ? 'Please enter your Last name' : undefined;

  return (
    <TextInput
      required
      label={'Last Name'}
      name="last-name"
      type="text"
      autoComplete="family-name"
      onBlur={onBlur}
      onInput={onInput}
      onInvalid={onInvalid}
      error={errorMessage}
    />
  );
};

const NameInputFieldset = () => {
  return (
    <fieldset css={fieldset}>
      <FirstNameInput />
      <LastNameInput />
    </fieldset>
  );
};

export default NameInputFieldset;
