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

export const WithPageTitle = () => (
  <MainLayout pageTitle="Page title">Hello world</MainLayout>
);
WithPageTitle.storyName = 'with pageTitle';
