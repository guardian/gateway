/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ResetPasswordPage as ResetPassword } from './ResetPassword';

export default {
  title: 'Pages/ResetPassword',
  component: ResetPassword,
} as Meta;

export const Default = () => <ResetPassword />;
