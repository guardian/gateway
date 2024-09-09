import React from 'react';
import { Meta } from '@storybook/react';

import { DetailedRecaptchaError } from '@/client/components/DetailedRecaptchaError';
import { ErrorSummary } from '@guardian/source-development-kitchen/react-components';
import { errorMessageStyles } from '@/client/styles/Shared';

export default {
	title: 'Components/DetailedRecaptchaError',
	component: DetailedRecaptchaError,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => (
	<ErrorSummary
		message="reCAPTCHA verification failed"
		context={<DetailedRecaptchaError />}
		cssOverrides={errorMessageStyles}
	/>
);
Default.storyName = 'default';
