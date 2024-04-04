import React from 'react';
import { Meta } from '@storybook/react';

import { JobsTermsAccept } from '@/client/pages/JobsTermsAccept';

export default {
	title: 'Pages/JobsTermsAccept',
	component: JobsTermsAccept,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => (
	<JobsTermsAccept
		firstName="First name"
		secondName="Second name"
		submitUrl="/"
	/>
);
Default.story = {
	name: 'with defaults',
};

export const NameOnly = () => (
	<JobsTermsAccept
		submitUrl="/"
		email="test@email.com"
		secondName="I'm the only name set!"
		userBelongsToGRS={true}
	/>
);
