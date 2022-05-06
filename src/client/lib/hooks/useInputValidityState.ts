import { useCallback, useState } from 'react';

export enum InputFieldState {
  VALID = 'valid',
  EMPTY = 'empty',
  INVALID = 'invalid',
}

export const useInputValidityState = (
  initialState = InputFieldState.VALID,
): {
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onInput: React.FormEventHandler<HTMLInputElement>;
  onInvalid: React.FormEventHandler<HTMLInputElement>;
  inputFieldState: InputFieldState;
} => {
  const [inputFieldState, setInputFieldState] =
    useState<InputFieldState>(initialState);

  // Transition error message state based upon the
  // HTML ValidityState object returned from the input.
  const transitionState = useCallback((validityState: ValidityState) => {
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
      setInputFieldState(InputFieldState.EMPTY);
    } else if (emailInputIsInvalid) {
      setInputFieldState(InputFieldState.INVALID);
    } else {
      setInputFieldState(InputFieldState.VALID);
    }
  }, []);

  const onBlur = useCallback<React.FocusEventHandler<HTMLInputElement>>(
    (e) => {
      // Transition error state when the input box loses focus.
      transitionState(e.target.validity);
    },
    [transitionState],
  );

  const onInput = useCallback<React.FormEventHandler<HTMLInputElement>>(
    (e) => {
      // We check the `composed` variable to see if the event originated from user input.
      // This is so that we can run validation when users submit an email through a password manager.
      // Composed is not supported in IE11, so we check to see if it's undefined first.
      const notOriginatingFromUserInput =
        e.nativeEvent.composed !== undefined && !e.nativeEvent.composed;

      if (notOriginatingFromUserInput) {
        e.currentTarget.checkValidity();
        transitionState(e.currentTarget.validity);
      }
    },
    [transitionState],
  );

  const onInvalid = useCallback<React.FormEventHandler<HTMLInputElement>>(
    (e) => {
      // Prevent default browser popup from firing.
      e.preventDefault();
      // Transition error state when the invalid event fires.
      transitionState(e.currentTarget.validity);
    },
    [transitionState],
  );

  return {
    onBlur,
    onInput,
    onInvalid,
    inputFieldState,
  };
};
