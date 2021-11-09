import React from 'react';
import { Meta } from '@storybook/react';

import { ResetPassword } from './ResetPassword';
import { PageBodyText } from '../components/PageBodyText';

export default {
  title: 'Pages/ResetPassword',
  component: ResetPassword,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <ResetPassword headerText="Forgotten password" buttonText="Reset Password">
    <PageBodyText>
      Forgotten or need to set your password? We will email you a link to change
      or set it.
    </PageBodyText>
  </ResetPassword>
);
Default.story = {
  name: 'with defaults',
};

export const Email = () => (
  <ResetPassword
    email="cleo@theguardian.com"
    headerText="Forgotten password"
    buttonText="Reset Password"
  >
    <PageBodyText>
      Forgotten or need to set your password? We will email you a link to change
      or set it.
    </PageBodyText>
  </ResetPassword>
);
Email.story = {
  name: 'with email',
};
