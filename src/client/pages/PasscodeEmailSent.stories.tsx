import React from 'react';
import { Meta } from '@storybook/react';

import { PasscodeEmailSent } from '@/client/pages/PasscodeEmailSent';

export default {
	title: 'Pages/PasscodeEmailSent',
	component: PasscodeEmailSent,
} as Meta;

export const Defaults = () => (
	<PasscodeEmailSent passcodeAction="#" expiredPage="#" />
);
Defaults.story = {
	name: 'with defaults',
};

export const ChangeEmail = () => (
	<PasscodeEmailSent passcodeAction="#" expiredPage="#" changeEmailPage="#" />
);
ChangeEmail.story = {
	name: 'with changeEmailPage',
};

export const WithEmail = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
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
		expiredPage="#"
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
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
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
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		recaptchaSiteKey="invalid-key"
	/>
);
WithRecaptchaError.story = {
	name: 'with reCAPTCHA error',
};

export const WithSuccessMessage = () => (
	<PasscodeEmailSent passcodeAction="#" expiredPage="#" showSuccess={true} />
);
WithSuccessMessage.story = {
	name: 'with success message',
};

export const WithErrorMessage = () => (
	<PasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
		errorMessage="•⩊• UwU"
	/>
);
WithErrorMessage.story = {
	name: 'with error message',
};

export const DefaultsRegistration = () => (
	<PasscodeEmailSent passcodeAction="#/register" expiredPage="#" />
);
DefaultsRegistration.story = {
	name: 'with defaults - create account',
};

export const ChangeEmailRegistration = () => (
	<PasscodeEmailSent
		passcodeAction="#/register"
		expiredPage="#"
		changeEmailPage="#"
	/>
);
ChangeEmailRegistration.story = {
	name: 'with changeEmailPage - create account',
};

export const WithEmailRegistration = () => (
	<PasscodeEmailSent
		passcodeAction="#register"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
	/>
);
WithEmailRegistration.story = {
	name: 'with email - create account',
};

export const WithPasscodeRegistration = () => (
	<PasscodeEmailSent
		passcodeAction="#/register"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		passcode="123456"
	/>
);
WithPasscodeRegistration.story = {
	name: 'with passcode - create account',
};

export const WithPasscodeErrorRegistration = () => (
	<PasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#/register"
		expiredPage="#"
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
WithPasscodeErrorRegistration.story = {
	name: 'with passcode error - create account',
};

export const WithRecaptchaErrorRegistration = () => (
	<PasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#/register"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		recaptchaSiteKey="invalid-key"
	/>
);
WithRecaptchaErrorRegistration.story = {
	name: 'with reCAPTCHA error - create account',
};

export const WithSuccessMessageRegistration = () => (
	<PasscodeEmailSent
		passcodeAction="#/register"
		expiredPage="#"
		showSuccess={true}
	/>
);
WithSuccessMessageRegistration.story = {
	name: 'with success message - create account',
};

export const WithErrorMessageRegistration = () => (
	<PasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#/register"
		expiredPage="#"
		errorMessage="•⩊• UwU"
	/>
);
WithErrorMessageRegistration.story = {
	name: 'with error message - create account',
};
