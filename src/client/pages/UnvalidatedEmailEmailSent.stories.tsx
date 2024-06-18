/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { EmailSent } from '@/client/pages/EmailSent';
import { MainBodyText } from '@/client/components/MainBodyText';

export default {
	title: 'Pages/UnvalidatedEmailEmailSent',
	component: EmailSent,
} as Meta;

export const Defaults = () => (
	<EmailSent changeEmailPage="/signin">
		<MainBodyText>
			For security reasons we need you to change your password.
		</MainBodyText>
	</EmailSent>
);
Defaults.story = {
	name: 'with defaults',
};

export const WithEmail = () => (
	<EmailSent changeEmailPage="/signin" email="example@theguardian.com">
		<MainBodyText>
			For security reasons we need you to change your password.
		</MainBodyText>
	</EmailSent>
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
	>
		<MainBodyText>
			For security reasons we need you to change your password.
		</MainBodyText>
	</EmailSent>
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
	>
		<MainBodyText>
			For security reasons we need you to change your password.
		</MainBodyText>
	</EmailSent>
);
WithRecaptchaError.story = {
	name: 'with reCAPTCHA error',
};
