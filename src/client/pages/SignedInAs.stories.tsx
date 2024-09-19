import React from 'react';
import { Meta } from '@storybook/react';

import { SignedInAs } from '@/client/pages/SignedInAs';
import { SignInErrors } from '@/shared/model/Errors';

export default {
	title: 'Pages/SignedInAs',
	component: SignedInAs,
} as Meta;

export const Default = () => (
	<SignedInAs email="test@example.com" continueLink="#" signOutLink="#" />
);

export const NativeApp = () => (
	<SignedInAs
		email="test@example.com"
		continueLink="#"
		signOutLink="#"
		appName="Guardian"
	/>
);

export const FeastApp = () => (
	<SignedInAs
		email="test@example.com"
		continueLink="#"
		signOutLink="#"
		appName="Feast"
	/>
);

export const Error = () => (
	<SignedInAs
		email="test@example.com"
		continueLink="#"
		signOutLink="#"
		pageError={'Something went wrong'}
		shortRequestId="123e4567"
	/>
);

export const LoginRequiredError = () => (
	<SignedInAs
		email="test@example.com"
		continueLink="#"
		signOutLink="#"
		pageError={SignInErrors.GENERIC}
		queryParams={{ returnUrl: '#', error: 'login_required' }}
		shortRequestId="123e4567"
	/>
);
