import React from 'react';
import { Meta } from '@storybook/react';

import { Registration } from './Registration';

export default {
  title: 'Pages/Registration',
  component: Registration,
} as Meta;

export const Default = () => <Registration />;
Default.story = {
  name: 'with defaults',
};
