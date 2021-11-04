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

export const WithErrorPageTitle = () => (
  <MainLayout pageTitle="Page title" errorOverride="Error message">
    Hello world
  </MainLayout>
);
WithErrorPageTitle.storyName = 'with Error and PageTitle';

export const WithSuccessPageTitle = () => (
  <MainLayout pageTitle="Page title" successOverride="Success message">
    Hello world
  </MainLayout>
);
WithSuccessPageTitle.storyName = 'with Success and PageTitle';

export const WithError = () => (
  <MainLayout errorOverride="Error message">Hello world</MainLayout>
);
WithError.storyName = 'with Error';

export const WithSuccess = () => (
  <MainLayout successOverride="Success message">Hello world</MainLayout>
);
WithSuccess.storyName = 'with Success';
