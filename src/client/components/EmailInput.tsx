import { TextInput, TextInputProps } from '@guardian/source-react-components';
import React, { useState } from 'react';
import {
  disableAutofillBackground,
  noBorderRadius,
} from '@/client/styles/Shared';

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
  label?: string;
  defaultValue?: string;
  initialState?: EmailInputFieldState;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  label = 'Email',
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
      validityState.customError ||
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
      label={label}
      name="email"
      type="email"
      autoComplete="email"
      error={errorMessage}
      cssOverrides={[disableAutofillBackground, noBorderRadius]}
      onBlur={(e) => {
        // Transition error state when the input box loses focus.
        transitionState(e.target.validity);
      }}
      onInput={(e) => {
        // We check the `composed` variable to see if the event originated from user input.
        // This is so that we can run validation when users submit an email through a password manager.
        // Composed is not supported in IE11, so we check to see if it's undefined first.
        const notOriginatingFromUserInput =
          e.nativeEvent.composed !== undefined && !e.nativeEvent.composed;

        if (notOriginatingFromUserInput) {
          e.currentTarget.checkValidity();
          transitionState(e.currentTarget.validity);
        }
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
