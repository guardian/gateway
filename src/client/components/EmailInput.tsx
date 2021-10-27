import { TextInput, TextInputProps } from '@guardian/src-text-input';
import React, { useState } from 'react';

export enum EmailInputFieldState {
  VALID = 'valid',
  EMPTY = 'empty',
  INVALID = 'invalid',
}

enum EmailInputFieldErrorMessages {
  INVALID = 'Please enter a valid email format.',
  EMPTY = 'Please enter your email.',
}

interface EmailInputProps extends Omit<TextInputProps, 'label'> {
  defaultValue?: string;
  initialState?: EmailInputFieldState;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  initialState = EmailInputFieldState.VALID,
  ...rest
}) => {
  const [emailInputFieldState, setEmailInputFieldState] =
    useState<EmailInputFieldState>(initialState);

  // Set the error message based on the current state.
  const errorMessage = React.useMemo(() => {
    switch (emailInputFieldState) {
      case EmailInputFieldState.INVALID:
        return EmailInputFieldErrorMessages.INVALID;
      case EmailInputFieldState.EMPTY:
        return EmailInputFieldErrorMessages.EMPTY;
    }
  }, [emailInputFieldState]);

  // Transition error message state based upon the
  // HTML ValidityState object returned from the input.
  const transitionState = (validityState: ValidityState) => {
    const emailInputIsInvalid =
      validityState.badInput ||
      validityState.patternMismatch ||
      validityState.rangeOverflow ||
      validityState.rangeUnderflow ||
      validityState.tooLong ||
      validityState.tooShort ||
      validityState.stepMismatch ||
      validityState.typeMismatch;

    const emailInputIsEmpty = validityState.valueMissing;

    if (emailInputIsEmpty) {
      setEmailInputFieldState(EmailInputFieldState.EMPTY);
    } else if (emailInputIsInvalid) {
      setEmailInputFieldState(EmailInputFieldState.INVALID);
    } else {
      setEmailInputFieldState(EmailInputFieldState.VALID);
    }
  };

  return (
    <TextInput
      label="Email"
      name="email"
      type="email"
      error={errorMessage}
      onBlur={(e) => {
        // Transition error state when the input box loses focus.
        transitionState(e.target.validity);
      }}
      onInvalid={(e) => {
        // Prevent default browser popup from firing.
        e.preventDefault();
        // Transition error state when the invalid event fires.
        transitionState(e.currentTarget.validity);
      }}
      {...rest}
    />
  );
};
