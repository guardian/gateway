import React from 'react';
import { Meta } from '@storybook/react';

import { SignIn, SignInProps } from '@/client/pages/SignIn';
import { PasscodeErrors, SignInErrors } from '@/shared/model/Errors';

export default {
	title: 'Pages/SignIn',
	component: SignIn,
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
	<SignIn pageError="This is an error" shortRequestId="123e4567" {...args} />
);
WithPageLevelError.story = {
	name: 'with page level error',
};

export const WithPageLevelErrorAndEmail = (args: SignInProps) => (
	<SignIn
		pageError="This is an error"
		email="test@example.com"
		shortRequestId="123e4567"
		{...args}
	/>
);
WithPageLevelErrorAndEmail.story = {
	name: 'with page level error and email',
};

export const SocialSigninBlocked = (args: SignInProps) => (
	<SignIn
		{...args}
		pageError={SignInErrors.SOCIAL_SIGNIN_ERROR}
		email="someone@theguardian.com"
	/>
);
SocialSigninBlocked.story = {
	name: 'social sign-in blocked',
};

export const WithFormLevelError = (args: SignInProps) => (
	<SignIn formError="This is an error" shortRequestId="123e4567" {...args} />
);
WithFormLevelError.story = {
	name: 'with form level error',
};

export const WithFormLevelErrorAndEmail = (args: SignInProps) => (
	<SignIn
		formError="This is an error"
		email="test@example.com"
		shortRequestId="123e4567"
		{...args}
	/>
);
WithFormLevelErrorAndEmail.story = {
	name: 'with form level error and email',
};

export const WithFormLevelErrorAndSocialSigninBlocked = (args: SignInProps) => (
	<SignIn
		{...args}
		pageError={SignInErrors.SOCIAL_SIGNIN_ERROR}
		formError="This is an error"
		email="someone@theguardian.com"
		shortRequestId="123e4567"
	/>
);
WithFormLevelErrorAndSocialSigninBlocked.story = {
	name: 'form level error and social sign-in blocked',
};

export const InvalidRecaptcha = (args: SignInProps) => (
	<SignIn {...args} recaptchaSiteKey="invalid-key" shortRequestId="123e4567" />
);
InvalidRecaptcha.story = {
	name: 'with reCAPTCHA error',
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
		pageError={SignInErrors.SOCIAL_SIGNIN_ERROR}
		email="someone@theguardian.com"
		shortRequestId="123e4567"
	/>
);
WithJobsAndSocialSigninBlocked.story = {
	name: 'with Jobs terms and social sign-in blocked',
};

export const IsReauthenticate = (args: SignInProps) => (
	<SignIn {...{ ...args, isReauthenticate: true }} />
);
IsReauthenticate.story = {
	name: 'showing /reauthenticate page',
};

export const SignInWithPasscode = (args: SignInProps) => (
	<SignIn {...{ ...args, usePasscodeSignIn: true }} />
);
SignInWithPasscode.story = {
	name: 'sign in with passcode',
};

export const SignInWithPasscodeError = (args: SignInProps) => (
	<SignIn
		{...{
			...args,
			usePasscodeSignIn: true,
			pageError: PasscodeErrors.PASSCODE_EXPIRED,
		}}
	/>
);
SignInWithPasscodeError.story = {
	name: 'sign in with passcode error',
};

export const NoSocialButtons = (args: SignInProps) => (
	<SignIn {...{ ...args, hideSocialButtons: true }} />
);
NoSocialButtons.story = {
	name: 'no social buttons',
};

export const NoSocialButtonsEmail = (args: SignInProps) => (
	<SignIn
		{...{ ...args, hideSocialButtons: true, email: 'test@example.com' }}
	/>
);
NoSocialButtonsEmail.story = {
	name: 'no social buttons with email',
};
