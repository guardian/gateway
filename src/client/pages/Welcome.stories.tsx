import React from 'react';
import { Meta, StoryFn } from '@storybook/react';

import { Welcome } from '@/client/pages/Welcome';

export default {
	title: 'Pages/Welcome',
	component: Welcome,
	parameters: { layout: 'fullscreen' },
} as Meta<typeof Welcome>;

const Template: StoryFn<typeof Welcome> = ({
	submitUrl = '',
	fieldErrors = [],
	queryParams = { returnUrl: '#' },
	...otherProps
}) => (
	<Welcome
		submitUrl={submitUrl}
		fieldErrors={fieldErrors}
		queryParams={queryParams}
		{...otherProps}
	/>
);

export const Default = Template.bind({});
Default.storyName = 'with defaults';

export const Email = Template.bind({});
Email.args = { email: 'example@theguardian.com' };
Email.storyName = 'with email';

export const Jobs = Template.bind({});
Jobs.args = { isJobs: true };
Jobs.storyName = 'with clientId=jobs';

export const FieldErrorPW = Template.bind({});
FieldErrorPW.args = {
	email: 'example@theguardian.com',
	fieldErrors: [
		{
			field: 'password',
			message: 'Password must be between 8 and 72 characters.',
		},
	],
};
FieldErrorPW.storyName = 'with error on password';

export const PasswordAlreadySet = Template.bind({});
PasswordAlreadySet.args = {
	email: 'example@theguardian.com',
	submitUrl: '',
	passwordSet: true,
};
PasswordAlreadySet.storyName = 'with password already set';

export const PasswordAlreadySetJobs = Template.bind({});
PasswordAlreadySetJobs.args = {
	email: 'example@theguardian.com',
	submitUrl: '',
	passwordSet: true,
	isJobs: true,
};
PasswordAlreadySetJobs.storyName =
	'with password already set and clientId=jobs';
