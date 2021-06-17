/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ResetSent } from './ResetSent';

export default {
  title: 'Pages/ResetSent',
  component: ResetSent,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const NoInboxDetails = () => <ResetSent />;
NoInboxDetails.story = {
  name: 'with defaults',
};
