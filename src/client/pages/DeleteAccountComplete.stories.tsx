import React from 'react';
import { Meta } from '@storybook/react';

import { DeleteAccountComplete } from '@/client/pages/DeleteAccountComplete';

export default {
	title: 'Pages/DeleteAccountComplete',
	component: DeleteAccountComplete,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <DeleteAccountComplete returnUrl="#" />;
Default.story = {
	name: 'with default',
};
