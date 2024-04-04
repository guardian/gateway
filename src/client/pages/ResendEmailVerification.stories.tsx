/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ResendEmailVerification } from '@/client/pages/ResendEmailVerification';

export default {
	title: 'Pages/ResendEmailVerification',
	component: ResendEmailVerification,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const LoggedIn = () => (
	<ResendEmailVerification email="example@domain.com" />
);
LoggedIn.story = {
	name: 'when logged in without success',
};

export const LoggedInSuccess = () => (
	<ResendEmailVerification
		email="example@domain.com"
		successText="Email Sent. Check your inbox."
	/>
);
LoggedInSuccess.story = {
	name: 'when logged in with success',
};

export const LoggedOut = () => (
	<ResendEmailVerification signInPageUrl="https://theguardian.com/uk" />
);
LoggedOut.story = {
	name: 'when logged out',
};
