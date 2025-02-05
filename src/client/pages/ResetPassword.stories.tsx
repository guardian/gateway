import React from 'react';
import { Meta } from '@storybook/react';

import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';
import { ResetPasswordSessionExpiredPage } from '@/client/pages/ResetPasswordSessionExpiredPage';
import { PasscodeErrors } from '@/shared/model/Errors';

export default {
	title: 'Pages/ResetPassword',
	component: ResetPassword,
} as Meta;

export const Default = () => (
	<ResetPassword
		headerText="Reset password"
		buttonText="Request password reset"
		queryString={{ returnUrl: 'http://theguardian.com' }}
	>
		<MainBodyText>
			Enter your email address and we’ll send you instructions to reset your
			password.
		</MainBodyText>
	</ResetPassword>
);
Default.story = {
	name: 'with defaults',
};

export const Email = () => (
	<ResetPassword
		email="cleo@theguardian.com"
		headerText="Reset password"
		buttonText="Request password reset"
		queryString={{ returnUrl: 'https://theguardian.com' }}
	>
		<MainBodyText>
			Enter your email address and we’ll send you instructions to reset your
			password.
		</MainBodyText>
	</ResetPassword>
);
Email.story = {
	name: 'with email',
};

export const LinkExpired = () => (
	<ResetPassword
		email="test@theguardian.com"
		headerText="This link has expired"
		buttonText="Resend link"
		emailInputLabel="Email address"
		queryString={{ returnUrl: 'https://theguardian.com' }}
		showRecentEmailInformationBox
	>
		<MainBodyText>
			To receive a new link, please enter your email address below.
		</MainBodyText>
	</ResetPassword>
);
LinkExpired.story = {
	name: 'link expired copy',
};

export const SessionExpired = () => <ResetPasswordSessionExpiredPage />;
SessionExpired.story = {
	name: 'session expired/timed out copy',
};

export const RecaptchaError = () => (
	<ResetPassword
		shortRequestId="123e4567"
		email="cleo@theguardian.com"
		headerText="Forgot password"
		buttonText="Reset password"
		queryString={{ returnUrl: 'https://theguardian.com' }}
		recaptchaSiteKey="invalid-key"
	>
		<MainBodyText>
			Enter your email address and we’ll send you instructions to reset your
			password.
		</MainBodyText>
	</ResetPassword>
);
RecaptchaError.story = {
	name: 'with reCAPTCHA error',
};

export const PasscodeExpiredError = () => (
	<ResetPassword
		shortRequestId="123e4567"
		headerText="Reset password"
		buttonText="Request password reset"
		queryString={{ returnUrl: 'http://theguardian.com' }}
		pageError={PasscodeErrors.PASSCODE_EXPIRED}
	>
		<MainBodyText>
			Enter your email address and we’ll send you instructions to reset your
			password.
		</MainBodyText>
	</ResetPassword>
);
PasscodeExpiredError.story = {
	name: 'with passcode expired error',
};
