import React from 'react';
import { Meta } from '@storybook/react';

import { MainLayout } from './Main';

export default {
  title: 'Layout/Main',
  component: MainLayout,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <MainLayout>Hello world</MainLayout>;
Default.storyName = 'with defaults';
