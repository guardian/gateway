/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { EmailSent } from './EmailSent';

export default {
  title: 'Pages/EmailSent',
  component: EmailSent,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const NoInboxDetails = () => <EmailSent />;
NoInboxDetails.story = {
  name: 'with defaults',
};
