import React from 'react';
import { Meta } from '@storybook/react';

import { DeleteAccountReturnLink } from '@/client/components/DeleteAccountReturnLink';

export default {
	title: 'Components/DeleteAccountReturnLink',
	component: DeleteAccountReturnLink,
} as Meta;

export const Default = () => <DeleteAccountReturnLink />;
Default.storyName = 'default';
