/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { MagicLinkSent } from './MagicLinkSent';

export default {
  title: 'Pages/MagicLinkSent',
  component: MagicLinkSent,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const NoInboxDetails = () => <MagicLinkSent />;
NoInboxDetails.story = {
  name: 'with defaults',
};
