/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { EmailSent } from '@/client/pages/EmailSent';

export default {
	title: 'Pages/UnvalidatedEmailEmailSent',
	component: EmailSent,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Defaults = () => <EmailSent changeEmailPage="/signin" />;
Defaults.story = {
	name: 'with defaults',
};

export const WithEmail = () => (
	<EmailSent changeEmailPage="/signin" email="example@theguardian.com" />
);
WithEmail.story = {
	name: 'with email',
};

export const WithEmailResend = () => (
	<EmailSent
		changeEmailPage="/signin"
		email="example@theguardian.com"
		resendEmailAction="#"
		recaptchaSiteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
	/>
);
WithEmailResend.story = {
	name: 'with email and resend',
};

export const WithRecaptchaError = () => (
	<EmailSent
		changeEmailPage="/signin"
		email="example@theguardian.com"
		resendEmailAction="#"
		recaptchaSiteKey="invalid-key"
	/>
);
WithRecaptchaError.story = {
	name: 'with reCAPTCHA error',
};
