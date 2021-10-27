import { TextInput, TextInputProps } from '@guardian/src-text-input';
import React, { useState } from 'react';

export enum EmailFieldState {
  VALID = 'valid',
  EMPTY = 'empty',
  INVALID = 'invalid',
}

interface EmailInputProps extends Omit<TextInputProps, 'label'> {
  defaultValue?: string;
  initialState?: EmailFieldState;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  initialState = EmailFieldState.VALID,
  ...rest
}) => {
  const [emailFieldState, setEmailFieldState] =
    useState<EmailFieldState>(initialState);

  const transitionState = (inputValue: string, isInvalid: boolean) => {
    if (inputValue.trim() === '') {
      setEmailFieldState(EmailFieldState.EMPTY);
    } else if (isInvalid) {
      setEmailFieldState(EmailFieldState.INVALID);
    } else {
      setEmailFieldState(EmailFieldState.VALID);
    }
  };

  return (
    <TextInput
      label="Email"
      name="email"
      type="email"
      error={
        emailFieldState === EmailFieldState.INVALID
          ? 'Please enter a valid email format.'
          : emailFieldState === EmailFieldState.EMPTY
          ? 'Please enter your email.'
          : ''
      }
      onBlur={(e) => {
        const isInvalid = !e.target.checkValidity();
        transitionState(e.target.value, isInvalid);
      }}
      {...rest}
    />
  );
};
