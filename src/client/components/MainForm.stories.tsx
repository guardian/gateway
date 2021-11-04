import React from 'react';
import { Meta } from '@storybook/react';

import { inputMarginBottomSpacingStyle, MainForm } from './MainForm';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';

export default {
  title: 'Components/MainForm',
  component: MainForm,
} as Meta;

export const BasicForm = () => (
  <MainForm formAction="" submitButtonText="Send me a link">
    <EmailInput />
  </MainForm>
);
BasicForm.storyName = 'BasicForm';

export const MultipleInputFields = () => (
  <MainForm formAction="" submitButtonText="Send me a link">
    <EmailInput cssOverrides={inputMarginBottomSpacingStyle} />
    <PasswordInput label="Password" />
  </MainForm>
);
MultipleInputFields.storyName = 'MultipleInputFields';

export const FormWithRecaptcha = () => (
  <MainForm formAction="" submitButtonText="Send me a link" useRecaptcha>
    <EmailInput />
  </MainForm>
);
FormWithRecaptcha.storyName = 'FormWithRecaptcha';

export const FormWithGuardianTerms = () => (
  <MainForm formAction="" submitButtonText="Send me a link" hasGuardianTerms>
    <EmailInput />
  </MainForm>
);
FormWithGuardianTerms.storyName = 'FormWithGuardianTerms';

export const FormWithRecaptchaGuardianTerms = () => (
  <MainForm
    formAction=""
    submitButtonText="Send me a link"
    useRecaptcha
    hasGuardianTerms
  >
    <EmailInput />
  </MainForm>
);
FormWithRecaptchaGuardianTerms.storyName = 'FormWithRecaptchaGuardianTerms';

export const TertiarySubmitButton = () => (
  <MainForm
    formAction=""
    submitButtonText="Send me a link"
    submitButtonPriority="tertiary"
  >
    <EmailInput />
  </MainForm>
);
TertiarySubmitButton.storyName = 'TertiarySubmitButton';
