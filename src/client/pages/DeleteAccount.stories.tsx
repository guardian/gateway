import React from 'react';
import { Meta } from '@storybook/react';

import { DeleteAccount } from '@/client/pages/DeleteAccount';

export default {
	title: 'Pages/DeleteAccount',
	component: DeleteAccount,
} as Meta;

export const Default = () => (
	<DeleteAccount
		queryParams={{
			returnUrl: '#',
		}}
	/>
);
Default.story = {
	name: 'with defaults',
};

export const WithFormError = () => (
	<DeleteAccount
		shortRequestId="123e4567"
		queryParams={{
			returnUrl: '#',
		}}
		formError="Something went wrong"
	/>
);
WithFormError.story = {
	name: 'with form error',
};

export const WithFieldErrors = () => (
	<DeleteAccount
		shortRequestId="123e4567"
		queryParams={{
			returnUrl: '#',
		}}
		fieldErrors={[
			{
				field: 'password',
				message: 'Incorrect password',
			},
		]}
	/>
);
WithFieldErrors.story = {
	name: 'with field errors',
};
