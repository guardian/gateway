import React from 'react';
import { Meta } from '@storybook/react';

import { MainLayout } from './Main';
import {
  BasicForm,
  FormWithRecaptcha,
  MultipleInputFields,
} from '../components/MainForm.stories';
import { Paragraphs } from '../components/MainBodyText.stories';

export default {
  title: 'Layout/Main',
  component: MainLayout,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
  <MainLayout>
    <Paragraphs />
  </MainLayout>
);
Default.storyName = 'with defaults';

export const WithPageTitle = () => (
  <MainLayout pageTitle="Some page title">
    <Paragraphs />
  </MainLayout>
);
WithPageTitle.storyName = 'with pageTitle';

export const WithErrorPageTitle = () => (
  <MainLayout pageTitle="Some page title" errorOverride="Error message">
    <Paragraphs />
  </MainLayout>
);
WithErrorPageTitle.storyName = 'with Error and PageTitle';

export const WithSuccessPageTitle = () => (
  <MainLayout pageTitle="Some page title" successOverride="Success message">
    <Paragraphs />
  </MainLayout>
);
WithSuccessPageTitle.storyName = 'with Success and PageTitle';

export const WithError = () => (
  <MainLayout errorOverride="Error message">
    <Paragraphs />
  </MainLayout>
);
WithError.storyName = 'with Error';

export const WithSuccess = () => (
  <MainLayout successOverride="Success message">
    <Paragraphs />
  </MainLayout>
);
WithSuccess.storyName = 'with Success';

export const WithForm = () => (
  <MainLayout pageTitle="Some page title">
    <Paragraphs />
    <BasicForm />
  </MainLayout>
);
WithForm.storyName = 'with Form';

export const WithFormAndRecaptcha = () => (
  <MainLayout pageTitle="Some page title">
    <Paragraphs />
    <FormWithRecaptcha />
  </MainLayout>
);
WithFormAndRecaptcha.storyName = 'with Form and reCAPTCHA';

export const WithMultipleInputs = () => (
  <MainLayout pageTitle="Some page title">
    <Paragraphs />
    <MultipleInputFields />
  </MainLayout>
);
WithMultipleInputs.storyName = 'with multiple inputs';
