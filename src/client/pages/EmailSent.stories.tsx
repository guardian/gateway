/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { EmailSent } from './EmailSent';

export default {
  title: 'Pages/EmailSent',
  component: EmailSent,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Defaults = () => <EmailSent />;
Defaults.story = {
  name: 'with defaults',
};

export const WithEmail = () => <EmailSent email="example@theguardian.com" />;
WithEmail.story = {
  name: 'with email',
};

export const WithSource = () => (
  <EmailSent email="example@theguardian.com" source="reset" />
);
WithSource.story = {
  name: 'with source',
};
