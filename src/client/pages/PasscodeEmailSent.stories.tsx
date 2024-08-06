import React from 'react';
import { Meta } from '@storybook/react';

import { PasscodeEmailSent } from '@/client/pages/PasscodeEmailSent';

export default {
	title: 'Pages/PasscodeEmailSent',
	component: PasscodeEmailSent,
} as Meta;

export const Defaults = () => <PasscodeEmailSent passcodeAction="#" />;
Defaults.story = {
	name: 'with defaults',
};

export const ChangeEmail = () => (
	<PasscodeEmailSent passcodeAction="#" changeEmailPage="#" />
);
ChangeEmail.story = {
	name: 'with changeEmailPage',
};

export const WithEmail = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		changeEmailPage="#"
		email="example@theguardian.com"
	/>
);
WithEmail.story = {
	name: 'with email',
};

export const WithPasscode = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		passcode="123456"
	/>
);
WithPasscode.story = {
	name: 'with passcode',
};

export const WithPasscodeError = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		passcode="123456"
		fieldErrors={[
			{
				field: 'code',
				message: 'Invalid code',
			},
		]}
	/>
);
WithPasscodeError.story = {
	name: 'with passcode error',
};

export const WithRecaptchaError = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		recaptchaSiteKey="invalid-key"
	/>
);
WithRecaptchaError.story = {
	name: 'with reCAPTCHA error',
};

export const WithSuccessMessage = () => (
	<PasscodeEmailSent passcodeAction="#" showSuccess={true} />
);
WithSuccessMessage.story = {
	name: 'with success message',
};

export const WithErrorMessage = () => (
	<PasscodeEmailSent passcodeAction="#" errorMessage="•⩊• UwU" />
);
