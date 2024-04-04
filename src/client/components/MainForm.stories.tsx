import React from 'react';
import { Meta } from '@storybook/react';

import {
	inputMarginBottomSpacingStyle,
	MainForm,
} from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { PasswordInput } from '@/client/components/PasswordInput';

export default {
	title: 'Components/MainForm',
	component: MainForm,
} as Meta;

export const BasicForm = () => (
	<MainForm formAction="" submitButtonText="Send me a link">
		<EmailInput />
	</MainForm>
);
BasicForm.storyName = 'BasicForm';

export const MultipleInputFields = () => (
	<MainForm formAction="" submitButtonText="Send me a link">
		<EmailInput cssOverrides={inputMarginBottomSpacingStyle} />
		<PasswordInput label="Password" />
	</MainForm>
);
MultipleInputFields.storyName = 'MultipleInputFields';

export const FormWithRecaptcha = () => (
	<MainForm
		formAction=""
		submitButtonText="Send me a link"
		recaptchaSiteKey="test"
	>
		<EmailInput />
	</MainForm>
);
FormWithRecaptcha.storyName = 'FormWithRecaptcha';

export const FormWithGuardianTerms = () => (
	<MainForm formAction="" submitButtonText="Send me a link" hasGuardianTerms>
		<EmailInput />
	</MainForm>
);
FormWithGuardianTerms.storyName = 'FormWithGuardianTerms';

export const FormWithRecaptchaGuardianTerms = () => (
	<MainForm
		formAction=""
		submitButtonText="Send me a link"
		recaptchaSiteKey="test"
		hasGuardianTerms
	>
		<EmailInput />
	</MainForm>
);
FormWithRecaptchaGuardianTerms.storyName = 'FormWithRecaptchaGuardianTerms';

export const FormWithRecaptchaJobsTerms = () => (
	<MainForm
		formAction=""
		submitButtonText="Send me a link"
		recaptchaSiteKey="test"
		hasJobsTerms
	>
		<EmailInput />
	</MainForm>
);
FormWithRecaptchaJobsTerms.storyName = 'FormWithRecaptchaJobsTerms';

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
	<MainForm formAction="" submitButtonText="Send me a link" submitButtonLink>
		<EmailInput hidden />
	</MainForm>
);
ButtonLinkSubmit.storyName = 'ButtonLinkSubmit';

export const FormWithError = () => (
	<MainForm
		formAction=""
		submitButtonText="Send me a link"
		formErrorMessageFromParent="This is an error"
		formErrorContextFromParent={<>This is additional error context</>}
	>
		<EmailInput />
	</MainForm>
);
FormWithError.storyName = 'FormWithError';

export const WithAdditionalTerms = () => (
	<MainForm
		formAction=""
		submitButtonText="Send me a link"
		additionalTerms="These are some additional terms"
	>
		<EmailInput />
	</MainForm>
);
WithAdditionalTerms.storyName = 'WithAdditionalTerms';
