import { NameFieldErrors } from '@/shared/model/Errors';
import { css } from '@emotion/react';
import { space, textSans } from '@guardian/source-foundations';
import { TextInput } from '@guardian/source-react-components';

import React, { FieldsetHTMLAttributes, useState, useEffect } from 'react';
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
  margin: ${space[2]}px 0 ${space[2]}px 0;
  ${textSans.medium()}
`;

interface NameInputProps {
  onError: (state: boolean) => void;
  defaultValue?: string;
}

const FirstNameInput = (props: NameInputProps) => {
  const { onBlur, inputFieldState, onInput, onInvalid } =
    useInputValidityState();

  const [errorMessage, setErrorMessage] = useState<string>();

  const isEmpty = inputFieldState === InputFieldState.EMPTY;

  useEffect(() => {
    if (props.onError) {
      setErrorMessage(isEmpty ? 'Please enter your First name' : undefined);
      props.onError(isEmpty);
    }
  }, [isEmpty, props]);

  return (
    <TextInput
      required
      label={'First Name'}
      name="firstName"
      type="text"
      autoComplete="given-name"
      css={fieldSpacing}
      onBlur={onBlur}
      onInput={onInput}
      onInvalid={onInvalid}
      error={errorMessage}
      defaultValue={props.defaultValue}
    />
  );
};

const SecondNameInput = (props: NameInputProps) => {
  const { onBlur, inputFieldState, onInput, onInvalid } =
    useInputValidityState();

  const [errorMessage, setErrorMessage] = useState<string>();

  const isEmpty = inputFieldState === InputFieldState.EMPTY;

  useEffect(() => {
    if (props.onError) {
      setErrorMessage(isEmpty ? 'Please enter your Last name' : undefined);
      props.onError(isEmpty);
    }
  }, [isEmpty, props]);

  return (
    <TextInput
      required
      label={'Last Name'}
      name="secondName"
      type="text"
      autoComplete="family-name"
      onBlur={onBlur}
      onInput={onInput}
      onInvalid={onInvalid}
      error={errorMessage}
      defaultValue={props.defaultValue}
    />
  );
};

/**
 * Utility hook to show the global name input field error on submit only.
 *
 * Usage:
 * When your form is submitted, call `setFormSubmitted(true)`.
 * Error field value and context will be set as long as `groupError` is true.
 *
 * When `groupError` is set to `false`, `formSubmitted` is also set to `false`—
 * this is so the global error will not show again until the next submit attempt.
 */
export const useNameInputFieldError = () => {
  const [groupError, setGroupError] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // We show a global name field error above the fold on submit if the form is submitted without one — or both — of the name fields
  // When the user corrects the global error, this effect resets the flag so it does not show again until the next submit attempt.
  useEffect(() => {
    if (groupError === false) {
      setFormSubmitted(false);
    }
  }, [groupError, setFormSubmitted]);

  const showNameFieldError = formSubmitted && groupError;

  const nameFieldError = showNameFieldError
    ? NameFieldErrors.INFORMATION_MISSING
    : undefined;

  const nameFieldErrorContext = showNameFieldError
    ? 'Please enter your First name and Last name'
    : undefined;

  return {
    nameFieldError,
    nameFieldErrorContext,
    setGroupError,
    setFormSubmitted,
  };
};

interface NameInputFieldProps
  extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  onGroupError?: (errorOccurred: boolean) => void;
  firstName?: string;
  secondName?: string;
}

const NameInputField: React.FC<NameInputFieldProps> = (props) => {
  const { onGroupError, firstName, secondName, ...restProps } = props;

  const [firstNameError, setFirstNameError] = useState(false);
  const [secondNameError, setSecondNameError] = useState(false);

  useEffect(() => {
    if (onGroupError) {
      onGroupError(firstNameError || secondNameError);
    }
  }, [firstNameError, secondNameError, onGroupError]);

  return (
    <fieldset css={fieldset} {...restProps}>
      <FirstNameInput onError={setFirstNameError} defaultValue={firstName} />
      <SecondNameInput onError={setSecondNameError} defaultValue={secondName} />
    </fieldset>
  );
};

export default NameInputField;
