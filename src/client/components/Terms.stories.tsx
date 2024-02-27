import React from 'react';
import { Meta } from '@storybook/react';

import { GuardianTerms, JobsTerms, RecaptchaTerms, TermsBox } from './Terms';

export default {
	title: 'Components/Terms',
	component: GuardianTerms,
} as Meta;

export const Default = () => (
	<TermsBox>
		<GuardianTerms />
		<RecaptchaTerms />
	</TermsBox>
);

Default.storyName = 'Terms';

export const Jobs = () => (
	<TermsBox>
		<JobsTerms />
		<RecaptchaTerms />
	</TermsBox>
);

Jobs.storyName = 'Jobs terms';
