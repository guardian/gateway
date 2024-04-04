import React from 'react';
import { Meta } from '@storybook/react';

import { SignIn, SignInProps } from '@/client/pages/SignIn';
import { SignInErrors } from '@/shared/model/Errors';

export default {
	title: 'Pages/SignIn',
	component: SignIn,
	parameters: { layout: 'fullscreen' },
	args: {
		recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
		oauthBaseUrl: 'https://oauth.theguardian.com/',
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
		},
		isReauthenticate: false,
	},
} as Meta<SignInProps>;

export const Default = (args: SignInProps) => <SignIn {...args} />;
Default.story = {
	name: 'with defaults',
};

export const WithEmail = (args: SignInProps) => (
	<SignIn email="test@example.com" {...args} />
);
WithEmail.story = {
	name: 'with email',
};

export const WithPageLevelError = (args: SignInProps) => (
	<SignIn pageError="This is an error" {...args} />
);
WithPageLevelError.story = {
	name: 'with page level error',
};

export const WithPageLevelErrorAndEmail = (args: SignInProps) => (
	<SignIn pageError="This is an error" email="test@example.com" {...args} />
);
WithPageLevelErrorAndEmail.story = {
	name: 'with page level error and email',
};

export const SocialSigninBlocked = (args: SignInProps) => (
	<SignIn
		{...args}
		pageError={SignInErrors.ACCOUNT_ALREADY_EXISTS}
		email="someone@theguardian.com"
	/>
);
SocialSigninBlocked.story = {
	name: 'social sign-in blocked',
};

export const WithFormLevelError = (args: SignInProps) => (
	<SignIn formError="This is an error" {...args} />
);
WithFormLevelError.story = {
	name: 'with form level error',
};

export const WithFormLevelErrorAndEmail = (args: SignInProps) => (
	<SignIn formError="This is an error" email="test@example.com" {...args} />
);
WithFormLevelErrorAndEmail.story = {
	name: 'with form level error and email',
};

export const WithFormLevelErrorAndSocialSigninBlocked = (args: SignInProps) => (
	<SignIn
		{...args}
		pageError={SignInErrors.ACCOUNT_ALREADY_EXISTS}
		formError="This is an error"
		email="someone@theguardian.com"
	/>
);
WithFormLevelErrorAndSocialSigninBlocked.story = {
	name: 'form level error and social sign-in blocked',
};

export const InvalidRecaptcha = (args: SignInProps) => (
	<SignIn {...args} recaptchaSiteKey="invalid-key" />
);
InvalidRecaptcha.story = {
	name: 'with reCAPTCHA error',
};

export const WithoutRegisterButton = (args: SignInProps) => (
	<SignIn {...args} isReauthenticate />
);
WithoutRegisterButton.story = {
	name: 'without register button',
};

export const WithJobs = (args: SignInProps) => (
	<SignIn
		{...{ ...args, queryParams: { ...args.queryParams, clientId: 'jobs' } }}
	/>
);
WithJobs.story = {
	name: 'with Jobs terms',
};

export const WithJobsAndSocialSigninBlocked = (args: SignInProps) => (
	<SignIn
		{...{ ...args, queryParams: { ...args.queryParams, clientId: 'jobs' } }}
		pageError={SignInErrors.ACCOUNT_ALREADY_EXISTS}
		email="someone@theguardian.com"
	/>
);
WithJobsAndSocialSigninBlocked.story = {
	name: 'with Jobs terms and social sign-in blocked',
};
