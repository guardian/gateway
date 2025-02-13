import React from 'react';
import { Meta } from '@storybook/react';

import { NoScriptContext } from '@/client/components/NoScript';
import { ErrorSummary } from '@guardian/source-development-kitchen/react-components';
import { errorMessageStyles } from '@/client/styles/Shared';

export default {
	title: 'Components/NoScriptContext',
	component: NoScriptContext,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => (
	<ErrorSummary
		message="Please enable JavaScript in your browser"
		context={<NoScriptContext />}
		cssOverrides={errorMessageStyles}
	/>
);
Default.storyName = 'default';
