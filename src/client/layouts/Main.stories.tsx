import React from 'react';
import { Meta } from '@storybook/react';

import { MainLayout } from './Main';
import { MainBodyText } from '../components/MainBodyText';

export default {
  title: 'Layout/Main',
  component: MainLayout,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <MainLayout>
    <MainBodyText>Hello world</MainBodyText>
  </MainLayout>
);
Default.storyName = 'with defaults';

export const WithPageTitle = () => (
  <MainLayout pageTitle="Page title">
    <MainBodyText>Hello world</MainBodyText>
  </MainLayout>
);
WithPageTitle.storyName = 'with pageTitle';

export const WithErrorPageTitle = () => (
  <MainLayout pageTitle="Page title" errorOverride="Error message">
    <MainBodyText>Hello world</MainBodyText>
  </MainLayout>
);
WithErrorPageTitle.storyName = 'with Error and PageTitle';

export const WithSuccessPageTitle = () => (
  <MainLayout pageTitle="Page title" successOverride="Success message">
    <MainBodyText>Hello world</MainBodyText>
  </MainLayout>
);
WithSuccessPageTitle.storyName = 'with Success and PageTitle';

export const WithError = () => (
  <MainLayout errorOverride="Error message">
    <MainBodyText>Hello world</MainBodyText>
  </MainLayout>
);
WithError.storyName = 'with Error';

export const WithSuccess = () => (
  <MainLayout successOverride="Success message">
    <MainBodyText>Hello world</MainBodyText>
  </MainLayout>
);
WithSuccess.storyName = 'with Success';
