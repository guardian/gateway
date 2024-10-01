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
	name: 'with defaults - generic',
};

export const ChangeEmail = () => (
	<PasscodeEmailSent passcodeAction="#" expiredPage="#" changeEmailPage="#" />
);
ChangeEmail.story = {
	name: 'with changeEmailPage - generic',
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
	name: 'with email - generic',
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
	name: 'with passcode - generic',
};

export const WithNoAccountInfo = () => (
	<PasscodeEmailSent
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
	name: 'with passcode error - generic',
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
	name: 'with reCAPTCHA error - generic',
};

export const WithSuccessMessage = () => (
	<PasscodeEmailSent passcodeAction="#" expiredPage="#" showSuccess={true} />
);
WithSuccessMessage.story = {
	name: 'with success message - generic',
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
	name: 'with error message - generic',
};

export const DefaultsVerification = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		textType="verification"
	/>
);
DefaultsVerification.story = {
	name: 'with defaults - verification',
};

export const ChangeEmailVerification = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		textType="verification"
	/>
);
ChangeEmailVerification.story = {
	name: 'with changeEmailPage - verification',
};

export const WithEmailVerification = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		textType="verification"
	/>
);
WithEmailVerification.story = {
	name: 'with email - verification',
};

export const WithPasscodeVerification = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		passcode="123456"
		textType="verification"
	/>
);
WithPasscodeVerification.story = {
	name: 'with passcode - verification',
};

export const WithPasscodeErrorVerification = () => (
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
		textType="verification"
	/>
);
WithPasscodeErrorVerification.story = {
	name: 'with passcode error - verification',
};

export const WithRecaptchaErrorVerification = () => (
	<PasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		recaptchaSiteKey="invalid-key"
		textType="verification"
	/>
);
WithRecaptchaErrorVerification.story = {
	name: 'with reCAPTCHA error - verification',
};

export const WithSuccessMessageVerification = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		showSuccess={true}
		textType="verification"
	/>
);
WithSuccessMessageVerification.story = {
	name: 'with success message - verification',
};

export const WithErrorMessageVerification = () => (
	<PasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
		errorMessage="•⩊• UwU"
		textType="verification"
	/>
);
WithErrorMessageVerification.story = {
	name: 'with error message - verification',
};

export const DefaultsSecurity = () => (
	<PasscodeEmailSent passcodeAction="#" expiredPage="#" textType="security" />
);
DefaultsVerification.story = {
	name: 'with defaults - security',
};

export const ChangeEmailSecurity = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		textType="security"
	/>
);
ChangeEmailVerification.story = {
	name: 'with changeEmailPage - security',
};

export const WithEmailSecurity = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		textType="security"
	/>
);
WithEmailVerification.story = {
	name: 'with email - security',
};

export const WithPasscodeSecurity = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		passcode="123456"
		textType="security"
	/>
);
WithPasscodeVerification.story = {
	name: 'with passcode - security',
};

export const WithPasscodeErrorSecurity = () => (
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
		textType="security"
	/>
);
WithPasscodeErrorVerification.story = {
	name: 'with passcode error - security',
};

export const WithRecaptchaErrorSecurity = () => (
	<PasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
		changeEmailPage="#"
		email="example@theguardian.com"
		recaptchaSiteKey="invalid-key"
		textType="security"
	/>
);
WithRecaptchaErrorVerification.story = {
	name: 'with reCAPTCHA error - security',
};

export const WithSuccessMessageSecurity = () => (
	<PasscodeEmailSent
		passcodeAction="#"
		expiredPage="#"
		showSuccess={true}
		textType="security"
	/>
);
WithSuccessMessageVerification.story = {
	name: 'with success message - security',
};

export const WithErrorMessageSecurity = () => (
	<PasscodeEmailSent
		shortRequestId="123e4567"
		passcodeAction="#"
		expiredPage="#"
		errorMessage="•⩊• UwU"
		textType="security"
	/>
);
WithErrorMessageVerification.story = {
	name: 'with error message - security',
};
