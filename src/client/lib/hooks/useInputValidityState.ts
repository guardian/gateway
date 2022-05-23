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
    const inputIsInvalid =
      validityState.customError ||
      validityState.badInput ||
      validityState.patternMismatch ||
      validityState.rangeOverflow ||
      validityState.rangeUnderflow ||
      validityState.tooLong ||
      validityState.tooShort ||
      validityState.stepMismatch ||
      validityState.typeMismatch;

    const inputIsEmpty = validityState.valueMissing;

    if (inputIsEmpty) {
      setInputFieldState(InputFieldState.EMPTY);
    } else if (inputIsInvalid) {
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
      // This is so that we can run validation when users submit values through a password manager.
      // Composed is not supported in IE11, so we check to see if it's undefined first.
      const notOriginatingFromUserInput =
        e.nativeEvent.composed !== undefined && !e.nativeEvent.composed;

      // We also validate the field when filled via an autocomplete action in the browser.
      // We can tell when this happens because the `data` property will be undefined.
      // Usually from a keystroke, `data` would contain the value.
      const originatingFromAutoComplete =
        e.nativeEvent.composed !== undefined &&
        (e.nativeEvent as Event & { data?: string })?.data === undefined;

      if (notOriginatingFromUserInput || originatingFromAutoComplete) {
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
