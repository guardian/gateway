import React from 'react';
import { Meta } from '@storybook/react';

import { MainLayout } from '@/client/layouts/Main';
import {
	BasicForm,
	FormWithError,
	FormWithRecaptcha,
	MultipleInputFields,
} from '@/client/components/MainForm.stories';
import { Paragraphs } from '@/client/components/MainBodyText.stories';
import { DetailedRecaptchaError } from '@/client/components/DetailedRecaptchaError';

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

export const WithPageHeaderSubText = () => (
	<MainLayout pageHeader="Some page header" pageSubText="Some sub text too">
		<Paragraphs />
	</MainLayout>
);
WithPageHeader.storyName = 'with pageTitle and subtext';

export const WithErrorPageHeader = () => (
	<MainLayout pageHeader="Some page header" errorOverride="Error message">
		<Paragraphs />
	</MainLayout>
);
WithErrorPageHeader.storyName = 'with Error and PageTitle';

export const WithErrorPageHeaderSubText = () => (
	<MainLayout
		pageHeader="Some page header"
		errorOverride="Error message"
		pageSubText="Some sub text too"
	>
		<Paragraphs />
	</MainLayout>
);
WithErrorPageHeaderSubText.storyName = 'with Error, PageTitle and subtext';

export const WithSuccessPageHeader = () => (
	<MainLayout pageHeader="Some page header" successOverride="Success message">
		<Paragraphs />
	</MainLayout>
);
WithSuccessPageHeader.storyName = 'with Success and PageTitle';

export const WithSuccessPageHeaderSubText = () => (
	<MainLayout
		pageHeader="Some page header"
		successOverride="Success message"
		pageSubText="Some sub text too"
	>
		<Paragraphs />
	</MainLayout>
);
WithSuccessPageHeaderSubText.storyName = 'with Success, PageTitle, and subtext';

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

export const WithFormSubText = () => (
	<MainLayout pageHeader="Some page header" pageSubText="Some sub text too">
		<Paragraphs />
		<BasicForm />
	</MainLayout>
);
WithFormSubText.storyName = 'with Form & header sub text';

export const WithFormAndRecaptcha = () => (
	<MainLayout pageHeader="Some page header">
		<Paragraphs />
		<FormWithRecaptcha />
	</MainLayout>
);
WithFormAndRecaptcha.storyName = 'with Form and reCAPTCHA';

export const WithFormWithFormLevelError = () => (
	<MainLayout pageHeader="Some page header">
		<Paragraphs />
		<FormWithError />
	</MainLayout>
);
WithFormWithFormLevelError.storyName = 'with Form with form-level error';

export const WithErrorAndFormWithFormLevelError = () => (
	<MainLayout pageHeader="Some page header" errorOverride="Error message">
		<Paragraphs />
		<FormWithError />
	</MainLayout>
);
WithErrorAndFormWithFormLevelError.storyName =
	'with Error and Form with form-level error';

export const WithErrorAndFormWithFormLevelErrorSubText = () => (
	<MainLayout
		pageHeader="Some page header"
		errorOverride="Error message"
		pageSubText="Some sub text too"
	>
		<Paragraphs />
		<FormWithError />
	</MainLayout>
);
WithErrorAndFormWithFormLevelErrorSubText.storyName =
	'with Error, Form with form-level error, and header sub text';

export const WithMultipleInputs = () => (
	<MainLayout pageHeader="Some page header">
		<Paragraphs />
		<MultipleInputFields />
	</MainLayout>
);
WithMultipleInputs.storyName = 'with multiple inputs';

export const OnNativeApp = () => (
	<MainLayout pageHeader="Some page header">
		<Paragraphs />
		<MultipleInputFields />
	</MainLayout>
);
OnNativeApp.storyName = 'on native app';
