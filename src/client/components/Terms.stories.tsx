import React from 'react';
import { Meta } from '@storybook/react';

import { Terms } from './Terms';

export default {
  title: 'Components/Terms',
  component: Terms,
} as Meta;

export const Default = () => <Terms />;
Default.storyName = 'Default terms';
