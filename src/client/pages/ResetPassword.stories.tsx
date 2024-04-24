import React from 'react';
import { Meta } from '@storybook/react';

import { ResetPassword } from '@/client/pages/ResetPassword';
import { MainBodyText } from '@/client/components/MainBodyText';

export default {
	title: 'Pages/ResetPassword',
	component: ResetPassword,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
	<ResetPassword
		headerText="Forgot password"
		buttonText="Reset password"
		queryString={{ returnUrl: 'http://theguardian.com' }}
		showNoAccessEmail
	>
		<MainBodyText>
			Forgot your password? Enter your email address and we’ll send you a link
			to create a new one.
		</MainBodyText>
	</ResetPassword>
);
Default.story = {
	name: 'with defaults',
};

export const Email = () => (
	<ResetPassword
		email="cleo@theguardian.com"
		headerText="Forgot password"
		buttonText="Reset password"
		queryString={{ returnUrl: 'https://theguardian.com' }}
		showNoAccessEmail
	>
		<MainBodyText>
			Forgot your password? Enter your email address and we’ll send you a link
			to create a new one.
		</MainBodyText>
	</ResetPassword>
);
Email.story = {
	name: 'with email',
};

export const LinkExpired = () => (
	<ResetPassword
		email="test@theguardian.com"
		headerText="Link expired"
		buttonText="Send me a link"
		emailInputLabel="Email address"
		queryString={{ returnUrl: 'https://theguardian.com' }}
		showRecentEmailSummary
	>
		<MainBodyText>This link has expired.</MainBodyText>
		<MainBodyText>
			To receive a new link, please enter your email address below.
		</MainBodyText>
	</ResetPassword>
);
LinkExpired.story = {
	name: 'link expired copy',
};

export const SessionExpired = () => (
	<ResetPassword
		email="test@theguardian.com"
		headerText="Session timed out"
		buttonText="Send me a link"
		emailInputLabel="Email address"
		queryString={{ returnUrl: 'https://theguardian.com' }}
	>
		<MainBodyText>
			The link we sent you was valid for 60 minutes and it has now expired.
		</MainBodyText>
		<MainBodyText>
			To receive a new link, please enter your email address below.
		</MainBodyText>
	</ResetPassword>
);
SessionExpired.story = {
	name: 'session expired/timed out copy',
};

export const RecaptchaError = () => (
	<ResetPassword
		email="cleo@theguardian.com"
		headerText="Forgot password"
		buttonText="Reset password"
		queryString={{ returnUrl: 'https://theguardian.com' }}
		showNoAccessEmail
		recaptchaSiteKey="invalid-key"
	>
		<MainBodyText>
			Forgot your password? Enter your email address and we’ll send you a link
			to create a new one.
		</MainBodyText>
	</ResetPassword>
);
RecaptchaError.story = {
	name: 'with reCAPTCHA error',
};
