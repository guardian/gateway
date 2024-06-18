import React from 'react';
import { Meta } from '@storybook/react';

import { RegisterWithEmail } from '@/client/pages/RegisterWithEmail';
import { RegistrationProps } from '@/client/pages/Registration';

export default {
	title: 'Pages/RegisterWithEmail',
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
	<RegisterWithEmail {...args} />
);
Default.story = {
	name: 'with defaults',
};

export const ReturnUrl = (args: RegistrationProps) => (
	<RegisterWithEmail
		{...args}
		queryParams={{ returnUrl: 'https://www.theguardian.com/uk' }}
	/>
);
ReturnUrl.story = {
	name: 'with returnUrl',
};

export const Email = (args: RegistrationProps) => (
	<RegisterWithEmail {...args} email="someone@theguardian.com" />
);
Email.story = {
	name: 'with email',
};

export const InvalidRecaptcha = (args: RegistrationProps) => (
	<RegisterWithEmail {...args} recaptchaSiteKey="invalid-key" />
);
InvalidRecaptcha.story = {
	name: 'with reCAPTCHA error',
};

export const GBGeolocation = (args: RegistrationProps) => (
	<RegisterWithEmail {...args} geolocation="GB" />
);
GBGeolocation.story = {
	name: 'with GB geolocation',
};

export const USGeolocation = (args: RegistrationProps) => (
	<RegisterWithEmail {...args} geolocation="US" />
);
USGeolocation.story = {
	name: 'with US geolocation',
};

export const AUGeolocation = (args: RegistrationProps) => (
	<RegisterWithEmail {...args} geolocation="AU" />
);
AUGeolocation.story = {
	name: 'with AU geolocation',
};

export const EUGeolocation = (args: RegistrationProps) => (
	<RegisterWithEmail {...args} geolocation="EU" />
);
EUGeolocation.story = {
	name: 'with EU geolocation',
};

export const ROWGeolocation = (args: RegistrationProps) => (
	<RegisterWithEmail {...args} geolocation="ROW" />
);
ROWGeolocation.story = {
	name: 'with ROW geolocation',
};

export const UndefinedGeolocation = (args: RegistrationProps) => (
	<RegisterWithEmail {...args} geolocation={undefined} />
);
UndefinedGeolocation.story = {
	name: 'with undefined geolocation',
};

export const FeastApp = (args: RegistrationProps) => (
	<RegisterWithEmail {...args} appName="Feast" />
);

FeastApp.story = {
	name: 'with Feast app',
};
