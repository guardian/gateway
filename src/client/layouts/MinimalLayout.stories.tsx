import React from 'react';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import NameInputField from '@/client/components/NameInputField';

export default {
	title: 'Layout/Minimal',
	component: MinimalLayout,
};

const Paragraphs = () => (
	<>
		<MainBodyText>
			<strong>The Jabberwocky</strong>
		</MainBodyText>
		<MainBodyText>’Twas brillig, and the slithy toves</MainBodyText>
		<MainBodyText>Did gyre and gimble in the wabe;</MainBodyText>
		<MainBodyText>All mimsy were the borogoves,</MainBodyText>
		<MainBodyText>And the mome raths outgrabe.</MainBodyText>
	</>
);

const defaultArgs = {
	pageHeader: 'A heading',
};

const withLeadTextArgs = {
	...defaultArgs,
	leadText:
		"This is lead text. It's here to lead you into a sense of false security.",
};

export const Default = () => (
	<MinimalLayout {...defaultArgs}>
		<Paragraphs />
	</MinimalLayout>
);
Default.storyName = 'default';

export const WithLeadText = () => (
	<MinimalLayout {...withLeadTextArgs}>
		<Paragraphs />
	</MinimalLayout>
);
WithLeadText.storyName = 'with lead text';

export const WithErrorMessage = () => (
	<MinimalLayout
		{...withLeadTextArgs}
		errorOverride="An error occurred"
		errorContext="Some additional context."
		shortRequestId="123e4567"
	>
		<Paragraphs />
	</MinimalLayout>
);
WithErrorMessage.storyName = 'with error message';

export const WithSuccessMessage = () => (
	<MinimalLayout {...withLeadTextArgs} successOverride="Success!">
		<Paragraphs />
	</MinimalLayout>
);
WithSuccessMessage.storyName = 'with success message';

export const WithImage = () => (
	<MinimalLayout {...withLeadTextArgs} imageId="welcome">
		<Paragraphs />
	</MinimalLayout>
);
WithImage.storyName = 'with image';

export const WithImageAndErrorMessage = () => (
	<MinimalLayout
		{...withLeadTextArgs}
		imageId="welcome"
		errorOverride="An error occurred"
		errorContext="Some additional context."
		shortRequestId="123e4567"
	>
		<Paragraphs />
	</MinimalLayout>
);
WithImageAndErrorMessage.storyName = 'with image and error message';

export const WithForm = () => (
	<MinimalLayout {...withLeadTextArgs}>
		<Paragraphs />
		<MainForm formAction="/" submitButtonText="Submit">
			<NameInputField />
		</MainForm>
	</MinimalLayout>
);
WithForm.storyName = 'with form';

export const WithFormAndImage = () => (
	<MinimalLayout {...withLeadTextArgs} imageId="welcome">
		<Paragraphs />
		<MainForm formAction="/" submitButtonText="Submit">
			<NameInputField />
		</MainForm>
	</MinimalLayout>
);
WithFormAndImage.storyName = 'with form and image';

export const WithFormImageAndErrorMessage = () => (
	<MinimalLayout
		{...withLeadTextArgs}
		imageId="welcome"
		errorOverride="An error occurred"
		errorContext="Some additional context."
		shortRequestId="123e4567"
	>
		<Paragraphs />
		<MainForm formAction="/" submitButtonText="Submit">
			<NameInputField />
		</MainForm>
	</MinimalLayout>
);
WithFormImageAndErrorMessage.storyName = 'with form, image and error message';
