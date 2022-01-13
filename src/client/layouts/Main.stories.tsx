import React from 'react';
import { Meta } from '@storybook/react';

import { MainLayout } from './Main';
import {
  BasicForm,
  FormWithRecaptcha,
  MultipleInputFields,
} from '../components/MainForm.stories';
import { Paragraphs } from '../components/MainBodyText.stories';
import { DetailedRecaptchaError } from '../components/DetailedRecaptchaError';

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

export const WithPageHeader = () => (
  <MainLayout pageHeader="Some page header">
    <Paragraphs />
  </MainLayout>
);
WithPageHeader.storyName = 'with pageTitle';

export const WithErrorPageHeader = () => (
  <MainLayout pageHeader="Some page header" errorOverride="Error message">
    <Paragraphs />
  </MainLayout>
);
WithErrorPageHeader.storyName = 'with Error and PageTitle';

export const WithSuccessPageHeader = () => (
  <MainLayout pageHeader="Some page header" successOverride="Success message">
    <Paragraphs />
  </MainLayout>
);
WithSuccessPageHeader.storyName = 'with Success and PageTitle';

export const WithError = () => (
  <MainLayout errorOverride="Error message">
    <Paragraphs />
  </MainLayout>
);
WithError.storyName = 'with Error';

export const WithErrorContext = () => (
  <MainLayout
    errorOverride="Error message"
    errorContext={<DetailedRecaptchaError />}
  >
    <Paragraphs />
  </MainLayout>
);

export const WithSuccess = () => (
  <MainLayout successOverride="Success message">
    <Paragraphs />
  </MainLayout>
);
WithSuccess.storyName = 'with Success';

export const WithForm = () => (
  <MainLayout pageHeader="Some page header">
    <Paragraphs />
    <BasicForm />
  </MainLayout>
);
WithForm.storyName = 'with Form';

export const WithFormAndRecaptcha = () => (
  <MainLayout pageHeader="Some page header">
    <Paragraphs />
    <FormWithRecaptcha />
  </MainLayout>
);
WithFormAndRecaptcha.storyName = 'with Form and reCAPTCHA';

export const WithMultipleInputs = () => (
  <MainLayout pageHeader="Some page header">
    <Paragraphs />
    <MultipleInputFields />
  </MainLayout>
);
WithMultipleInputs.storyName = 'with multiple inputs';
