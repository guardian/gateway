import React from 'react';
import { Meta } from '@storybook/react';

import { GuardianTerms, JobsTerms, RecaptchaTerms } from './Terms';

export default {
	title: 'Components/Terms',
	component: GuardianTerms,
} as Meta;

export const Default = () => (
	<>
		<GuardianTerms />
		<RecaptchaTerms />
	</>
);

Default.storyName = 'Terms';

export const Jobs = () => (
	<>
		<JobsTerms />
		<RecaptchaTerms />
	</>
);

Jobs.storyName = 'Jobs terms';
