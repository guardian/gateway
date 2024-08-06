import type { Meta } from '@storybook/react';
import React from 'react';
import { DeleteAccountComplete } from '@/client/pages/DeleteAccountComplete';

export default {
	title: 'Pages/DeleteAccountComplete',
	component: DeleteAccountComplete,
} as Meta;

export const Default = () => <DeleteAccountComplete returnUrl="#" />;
Default.story = {
	name: 'with default',
};
