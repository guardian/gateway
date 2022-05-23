import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Welcome } from './Welcome';

export default {
  title: 'Pages/Welcome',
  component: Welcome,
  parameters: { layout: 'fullscreen' },
} as ComponentMeta<typeof Welcome>;

const Template: ComponentStory<typeof Welcome> = ({
  submitUrl = '',
  fieldErrors = [],
  ...otherProps
}) => (
  <Welcome submitUrl={submitUrl} fieldErrors={fieldErrors} {...otherProps} />
);

export const Default = Template.bind({});
Default.storyName = 'with defaults';

export const Email = Template.bind({});
Email.args = { email: 'example@theguardian.com' };
Email.storyName = 'with email';

export const Jobs = Template.bind({});
Jobs.args = { isJobs: true };
Jobs.storyName = 'with clientId=jobs';

export const FieldErrorPW = Template.bind({});
FieldErrorPW.args = {
  email: 'example@theguardian.com',
  fieldErrors: [
    {
      field: 'password',
      message: 'Password must be between 8 and 72 characters.',
    },
  ],
};
FieldErrorPW.storyName = 'with error on password';

export const PasswordAlreadySet = Template.bind({});
PasswordAlreadySet.args = {
  email: 'example@theguardian.com',
  submitUrl: '',
  passwordSet: true,
};
PasswordAlreadySet.storyName = 'with password already set';
