/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { EmailSent } from '@/client/pages/EmailSent';

export default {
	title: 'Pages/EmailSent',
	component: EmailSent,
} as Meta;

export const Defaults = () => <EmailSent />;
Defaults.story = {
	name: 'with defaults',
};

export const ChangeEmail = () => (
	<EmailSent changeEmailPage="/reset-password" />
);
ChangeEmail.story = {
	name: 'with changeEmailPage',
};

export const WithEmail = () => (
	<EmailSent
		changeEmailPage="/reset-password"
		email="example@theguardian.com"
	/>
);
WithEmail.story = {
	name: 'with email',
};

export const WithEmailResend = () => (
	<EmailSent
		changeEmailPage="/reset-password"
		email="example@theguardian.com"
		resendEmailAction="#"
		recaptchaSiteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
	/>
);
WithEmailResend.story = {
	name: 'with email and resend',
};

export const WithEmailResendNoAccount = () => (
	<EmailSent
		changeEmailPage="/reset-password"
		email="example@theguardian.com"
		resendEmailAction="#"
		noAccountInfo
		recaptchaSiteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
	/>
);
WithEmailResendNoAccount.story = {
	name: 'with email, resend, and no account text',
};

export const WithRecaptchaError = () => (
	<EmailSent
		changeEmailPage="/reset-password"
		email="example@theguardian.com"
		resendEmailAction="#"
		recaptchaSiteKey="invalid-key"
	/>
);
WithRecaptchaError.story = {
	name: 'with reCAPTCHA error',
};

export const WithInstructionContext = () => (
	<EmailSent
		changeEmailPage="/reset-password"
		email="test@example.com"
		instructionContext="verify and complete creating your account"
	/>
);
WithInstructionContext.story = {
	name: 'with instruction context',
};

export const NoChangeEmailPage = () => (
	<EmailSent
		email="example@theguardian.com"
		resendEmailAction="#"
		noAccountInfo
		recaptchaSiteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
	/>
);
NoChangeEmailPage.story = {
	name: 'with no change email',
};

export const RegistrationEmailSent = () => (
	<EmailSent
		pageHeader="Check your inbox to verify your email"
		email="example@theguardian.com"
		changeEmailPage="/register"
		resendEmailAction="/register/email-sent/resend"
		instructionContext="verify and complete creating your account"
		recaptchaSiteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
		formTrackingName="register-resend"
	/>
);
RegistrationEmailSent.story = {
	name: 'Registration email sent page',
};

export const WithSuccessMessage = () => <EmailSent showSuccess={true} />;
WithSuccessMessage.story = {
	name: 'with success message',
};

export const WithErrorMessage = () => <EmailSent errorMessage="•⩊• UwU" />;
