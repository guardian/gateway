import { TextInput } from '@guardian/src-text-input';
import React, { useState } from 'react';

enum EmailFieldState {
  VALID = 'valid',
  EMPTY = 'empty',
  INVALID = 'invalid',
}

interface EmailInputProps {
  defaultValue?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({ defaultValue = '' }) => {
  const [emailFieldState, setEmailFieldState] = useState<EmailFieldState>(
    EmailFieldState.VALID,
  );

  return (
    <TextInput
      label="Email"
      name="email"
      type="email"
      defaultValue={defaultValue}
      error={
        emailFieldState === EmailFieldState.INVALID
          ? 'Please enter a valid email format.'
          : emailFieldState === EmailFieldState.EMPTY
          ? 'Please enter your email.'
          : ''
      }
      onBlur={(e) => {
        const isInvalid = !e.target.checkValidity();
        if (e.target.value === '') {
          setEmailFieldState(EmailFieldState.EMPTY);
        } else if (isInvalid) {
          setEmailFieldState(EmailFieldState.INVALID);
        } else {
          setEmailFieldState(EmailFieldState.VALID);
        }
      }}
    />
  );
};

export default EmailInput;
