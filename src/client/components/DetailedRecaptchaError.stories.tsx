import { ErrorSummary } from '@guardian/source-development-kitchen/react-components';
import type { Meta } from '@storybook/react';
import React from 'react';
import { DetailedRecaptchaError } from '@/client/components/DetailedRecaptchaError';
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
		css={errorMessageStyles}
	/>
);
Default.storyName = 'default';
