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
    />
  );
};

const LastNameInput = (props: NameInputProps) => {
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
      name="lastName"
      type="text"
      autoComplete="family-name"
      onBlur={onBlur}
      onInput={onInput}
      onInvalid={onInvalid}
      error={errorMessage}
    />
  );
};

export const useNameInputFieldError = () => {
  const [groupError, setGroupError] = useState(false);
  const [formInvalidOnSubmit, setFormInvalidOnSubmit] = useState(false);

  // We show a global name field error above the fold on submit if the form is submitted without one — or both — of the name fields
  // When the user corrects the global error, this effect resets the flag so it does not show again until the next submit attempt.
  useEffect(() => {
    if (!groupError) {
      setFormInvalidOnSubmit(false);
    }
  }, [groupError, setFormInvalidOnSubmit]);

  const showNameFieldError = formInvalidOnSubmit && groupError;

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
    setFormInvalidOnSubmit,
  };
};

interface NameInputFieldProps
  extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  onGroupError?: (state: boolean) => void;
}

const NameInputField: React.FC<NameInputFieldProps> = (props) => {
  const { onGroupError: setGroupError, ...restProps } = props;

  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);

  useEffect(() => {
    if (setGroupError) {
      setGroupError(firstNameError || lastNameError);
    }
  }, [firstNameError, lastNameError, setGroupError]);

  return (
    <fieldset css={fieldset} {...restProps}>
      <FirstNameInput onError={setFirstNameError} />
      <LastNameInput onError={setLastNameError} />
    </fieldset>
  );
};

export default NameInputField;
