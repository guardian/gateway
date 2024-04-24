import React from 'react';
import { Meta } from '@storybook/react';

import {
	PasswordInput,
	PasswordInputProps,
} from '@/client/components/PasswordInput';

export default {
	title: 'Components/PasswordInput',
	component: PasswordInput,
} as Meta<PasswordInputProps>;

export const Default = (props: Partial<PasswordInputProps>) => (
	<PasswordInput label="Password" {...props} />
);
Default.storyName = 'default';

export const WithError = (props: Partial<PasswordInputProps>) => (
	<PasswordInput label="Password" error="Error" {...props} />
);
WithError.storyName = 'with error';

export const WithSupporting = (props: Partial<PasswordInputProps>) => (
	<PasswordInput
		label="New password"
		supporting="Must be between 8 and 72 characters"
		{...props}
	/>
);
WithSupporting.storyName = 'with supporting text';

export const WithoutEye = (props: PasswordInputProps) => (
	<PasswordInput
		{...props}
		label="New password"
		supporting="Must be between 8 and 72 characters"
		displayEye={false}
	/>
);
WithoutEye.storyName = 'without eye';
