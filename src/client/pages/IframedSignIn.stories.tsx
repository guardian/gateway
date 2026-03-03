import React from 'react';
import { Meta } from '@storybook/react';

import {
	IframedSignIn,
	IframedSignInProps,
} from '@/client/pages/IframedSignIn';
import { PasscodeErrors, SignInErrors } from '@/shared/model/Errors';

export default {
	title: 'Pages/IframedSignIn',
	component: IframedSignIn,
	args: {
		recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
		oauthBaseUrl: 'https://oauth.theguardian.com/',
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
		},
		isReauthenticate: false,
	},
} as Meta<IframedSignInProps>;

export const Default = (args: IframedSignInProps) => (
	<IframedSignIn {...args} />
);
Default.story = {
	name: 'with defaults',
};

export const WithEmail = (args: IframedSignInProps) => (
	<IframedSignIn email="test@example.com" {...args} />
);
WithEmail.story = {
	name: 'with email',
};

export const WithPageLevelError = (args: IframedSignInProps) => (
	<IframedSignIn
		pageError="This is an error"
		shortRequestId="123e4567"
		{...args}
	/>
);
WithPageLevelError.story = {
	name: 'with page level error',
};

export const WithPageLevelErrorAndEmail = (args: IframedSignInProps) => (
	<IframedSignIn
		pageError="This is an error"
		email="test@example.com"
		shortRequestId="123e4567"
		{...args}
	/>
);
WithPageLevelErrorAndEmail.story = {
	name: 'with page level error and email',
};

export const SocialSigninBlocked = (args: IframedSignInProps) => (
	<IframedSignIn
		{...args}
		pageError={SignInErrors.SOCIAL_SIGNIN_ERROR}
		email="someone@theguardian.com"
	/>
);
SocialSigninBlocked.story = {
	name: 'social sign-in blocked',
};

export const WithFormLevelError = (args: IframedSignInProps) => (
	<IframedSignIn
		formError="This is an error"
		shortRequestId="123e4567"
		{...args}
	/>
);
WithFormLevelError.story = {
	name: 'with form level error',
};

export const WithFormLevelErrorAndEmail = (args: IframedSignInProps) => (
	<IframedSignIn
		formError="This is an error"
		email="test@example.com"
		shortRequestId="123e4567"
		{...args}
	/>
);
WithFormLevelErrorAndEmail.story = {
	name: 'with form level error and email',
};

export const WithFormLevelErrorAndSocialSigninBlocked = (
	args: IframedSignInProps,
) => (
	<IframedSignIn
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

export const InvalidRecaptcha = (args: IframedSignInProps) => (
	<IframedSignIn
		{...args}
		recaptchaSiteKey="invalid-key"
		shortRequestId="123e4567"
	/>
);
InvalidRecaptcha.story = {
	name: 'with reCAPTCHA error',
};

export const IsReauthenticate = (args: IframedSignInProps) => (
	<IframedSignIn {...{ ...args, isReauthenticate: true }} />
);
IsReauthenticate.story = {
	name: 'showing /reauthenticate page',
};

export const SignInWithPasscode = (args: IframedSignInProps) => (
	<IframedSignIn {...{ ...args, usePasscodeSignIn: true }} />
);
SignInWithPasscode.story = {
	name: 'sign in with passcode',
};

export const SignInWithPasscodeError = (args: IframedSignInProps) => (
	<IframedSignIn
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

export const NoSocialButtons = (args: IframedSignInProps) => (
	<IframedSignIn {...{ ...args, hideSocialButtons: true }} />
);
NoSocialButtons.story = {
	name: 'no social buttons',
};

export const NoSocialButtonsEmail = (args: IframedSignInProps) => (
	<IframedSignIn
		{...{ ...args, hideSocialButtons: true, email: 'test@example.com' }}
	/>
);
NoSocialButtonsEmail.story = {
	name: 'no social buttons with email',
};
