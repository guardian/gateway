import React from 'react';
import { Meta } from '@storybook/react';

import { IframedPasscodeEmailSent } from '@/client/pages/IframedPasscodeEmailSent';

export default {
	title: 'Pages/IframedPasscodeEmailSent',
	component: IframedPasscodeEmailSent,
} as Meta;

export const Defaults = () => (
	<IframedPasscodeEmailSent passcodeAction="#" expiredPage="#" />
);
Defaults.story = {
	name: 'with defaults - generic',
};

export const ChangeEmail = () => (
	<IframedPasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
	/>
);
ChangeEmail.story = {
	name: 'with changeEmailPage - generic',
};

export const WithEmail = () => (
	<IframedPasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
	/>
);
WithEmail.story = {
	name: 'with email - generic',
};

export const WithPasscode = () => (
	<IframedPasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		passcode="123456"
	/>
);
WithPasscode.story = {
	name: 'with passcode - generic',
};

export const WithNoAccountInfo = () => (
	<IframedPasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		passcode="123456"
		noAccountInfo
	/>
);
WithNoAccountInfo.story = {
	name: 'with no account info - generic',
};

export const WithPasscodeError = () => (
	<IframedPasscodeEmailSent
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
	name: 'with passcode error - generic',
};

export const WithRecaptchaError = () => (
	<IframedPasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		recaptchaSiteKey="invalid-key"
	/>
);
WithRecaptchaError.story = {
	name: 'with reCAPTCHA error - generic',
};

export const WithSuccessMessage = () => (
	<IframedPasscodeEmailSent passcodeAction="#" expiredPage="#" />
);
WithSuccessMessage.story = {
	name: 'with success message - generic',
};

export const WithErrorMessage = () => (
	<IframedPasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
		errorMessage="•⩊• UwU"
	/>
);
WithErrorMessage.story = {
	name: 'with error message - generic',
};

export const DefaultsVerification = () => (
	<IframedPasscodeEmailSent passcodeAction="#" expiredPage="#" />
);
DefaultsVerification.story = {
	name: 'with defaults - verification',
};

export const ChangeEmailVerification = () => (
	<IframedPasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
	/>
);
ChangeEmailVerification.story = {
	name: 'with changeEmailPage - verification',
};

export const WithEmailVerification = () => (
	<IframedPasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
	/>
);
WithEmailVerification.story = {
	name: 'with email - verification',
};

export const WithPasscodeVerification = () => (
	<IframedPasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		passcode="123456"
	/>
);
WithPasscodeVerification.story = {
	name: 'with passcode - verification',
};

export const WithPasscodeErrorVerification = () => (
	<IframedPasscodeEmailSent
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
WithPasscodeErrorVerification.story = {
	name: 'with passcode error - verification',
};

export const WithRecaptchaErrorVerification = () => (
	<IframedPasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		recaptchaSiteKey="invalid-key"
	/>
);
WithRecaptchaErrorVerification.story = {
	name: 'with reCAPTCHA error - verification',
};

export const WithSuccessMessageVerification = () => (
	<IframedPasscodeEmailSent passcodeAction="#" expiredPage="#" />
);
WithSuccessMessageVerification.story = {
	name: 'with success message - verification',
};

export const WithErrorMessageVerification = () => (
	<IframedPasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
		errorMessage="•⩊• UwU"
	/>
);
WithErrorMessageVerification.story = {
	name: 'with error message - verification',
};

export const DefaultsSecurity = () => (
	<IframedPasscodeEmailSent passcodeAction="#" expiredPage="#" />
);
DefaultsVerification.story = {
	name: 'with defaults - security',
};

export const DefaultsSignIn = () => (
	<IframedPasscodeEmailSent passcodeAction="#" expiredPage="#" />
);
DefaultsVerification.story = {
	name: 'with defaults - signin',
};

export const WithEmailSignIn = () => (
	<IframedPasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
	/>
);
WithEmailVerification.story = {
	name: 'with email - signin',
};

export const WithPasscodeSignIn = () => (
	<IframedPasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		passcode="123456"
	/>
);
WithPasscodeVerification.story = {
	name: 'with passcode - signin',
};

export const WithPasscodeErrorSignIn = () => (
	<IframedPasscodeEmailSent
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
WithPasscodeErrorVerification.story = {
	name: 'with passcode error - signin',
};

export const WithRecaptchaErrorSignIn = () => (
	<IframedPasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		recaptchaSiteKey="invalid-key"
	/>
);
WithRecaptchaErrorVerification.story = {
	name: 'with reCAPTCHA error - signin',
};

export const WithSuccessMessageSignIn = () => (
	<IframedPasscodeEmailSent passcodeAction="#" expiredPage="#" />
);
WithSuccessMessageVerification.story = {
	name: 'with success message - signin',
};

export const WithErrorMessageSignIn = () => (
	<IframedPasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
		errorMessage="•⩊• UwU"
	/>
);
WithErrorMessageVerification.story = {
	name: 'with error message - signin',
};
