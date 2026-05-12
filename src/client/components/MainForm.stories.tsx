import React from 'react';
import { Meta } from '@storybook/preact';

import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { PasswordInput } from '@/client/components/PasswordInput';

export default {
	title: 'Components/MainForm',
	component: MainForm,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const BasicForm = () => (
	<MainForm formAction="" submitButtonText="Send me a link">
		<EmailInput />
	</MainForm>
);
BasicForm.storyName = 'BasicForm';

export const MultipleInputFields = () => (
	<MainForm formAction="" submitButtonText="Send me a link">
		<EmailInput />
		<PasswordInput label="Password" />
	</MainForm>
);
MultipleInputFields.storyName = 'MultipleInputFields';

export const FormWithGuardianTerms = () => (
	<MainForm formAction="" submitButtonText="Send me a link" hasGuardianTerms>
		<EmailInput />
	</MainForm>
);
FormWithGuardianTerms.storyName = 'FormWithGuardianTerms';

export const TertiarySubmitButton = () => (
	<MainForm
		formAction=""
		submitButtonText="Send me a link"
		submitButtonPriority="tertiary"
	>
		<EmailInput />
	</MainForm>
);
TertiarySubmitButton.storyName = 'TertiarySubmitButton';

export const ButtonLinkSubmit = () => (
	<MainForm
		formAction=""
		submitButtonText="Send me a link"
		submitButtonLink
		displayInline
	>
		<EmailInput hidden hideLabel />
	</MainForm>
);
ButtonLinkSubmit.storyName = 'ButtonLinkSubmit';

export const FormWithError = () => (
	<MainForm
		formAction=""
		submitButtonText="Send me a link"
		formErrorMessageFromParent="This is an error"
		formErrorContextFromParent={<>This is additional error context</>}
		shortRequestId="123e4567"
	>
		<EmailInput />
	</MainForm>
);
FormWithError.storyName = 'FormWithError';

export const WithAdditionalTerms = () => (
	<MainForm
		formAction=""
		submitButtonText="Send me a link"
		additionalTerms={['These are some additional terms']}
	>
		<EmailInput />
	</MainForm>
);
WithAdditionalTerms.storyName = 'WithAdditionalTerms';
