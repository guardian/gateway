import React from 'react';
import { Meta } from '@storybook/react';

import { RegisterWithEmail } from '@/client/pages/RegisterWithEmail';
import { RegistrationProps } from '@/client/pages/Registration';
import { PasscodeErrors } from '@/shared/model/Errors';
import { IframedRegisterWithEmail } from './IframedRegisterWithEmail';

export default {
	title: 'Pages/IframedRegisterWithEmail',
	component: RegisterWithEmail,
	args: {
		recaptchaSiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
		oauthBaseUrl: 'https://oauth.theguardian.com/',
		queryParams: {
			returnUrl: 'https://www.theguardian.com/uk',
		},
	},
} as Meta<RegistrationProps>;

export const Default = (args: RegistrationProps) => (
	<IframedRegisterWithEmail {...args} />
);
Default.story = {
	name: 'with defaults',
};

export const Email = (args: RegistrationProps) => (
	<IframedRegisterWithEmail {...args} email="someone@theguardian.com" />
);
Email.story = {
	name: 'with email',
};

export const InvalidRecaptcha = (args: RegistrationProps) => (
	<IframedRegisterWithEmail
		{...args}
		recaptchaSiteKey="invalid-key"
		shortRequestId="123e4567"
	/>
);
InvalidRecaptcha.story = {
	name: 'with reCAPTCHA error',
};

export const WithPasscodeExpiredError = (args: RegistrationProps) => (
	<IframedRegisterWithEmail
		{...args}
		pageError={PasscodeErrors.PASSCODE_EXPIRED}
		shortRequestId="123e4567"
	/>
);
WithPasscodeExpiredError.story = {
	name: 'with defaults',
};
