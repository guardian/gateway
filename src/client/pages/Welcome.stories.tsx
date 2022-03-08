import React from 'react';
import { ComponentMeta, Story } from '@storybook/react';

import { Welcome } from './Welcome';

export default {
  title: 'Pages/Welcome',
  component: Welcome,
  parameters: { layout: 'fullscreen' },
} as ComponentMeta<typeof Welcome>;

type PartialProps = Partial<React.ComponentProps<typeof Welcome>>;

const Template: Story<PartialProps> = (props) => (
  <Welcome submitUrl="" fieldErrors={[]} {...props} />
);

export const Default = Template.bind({});
Default.storyName = 'with defaults';

export const Email = Template.bind({});
Email.args = { email: 'example@theguardian.com' };
Email.storyName = 'with email';

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
