import React from 'react';
import { Meta } from '@storybook/react';

import { DeleteAccount } from './DeleteAccount';

export default {
	title: 'Pages/DeleteAccount',
	component: DeleteAccount,
	parameters: { layout: 'fullscreen' },
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
