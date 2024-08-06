import type { Meta } from '@storybook/react';
import React from 'react';
import { EmailSentInformationBox } from '@/client/components/EmailSentInformationBox';

export default {
	title: 'Components/EmailSentInformationBox',
	component: EmailSentInformationBox,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => {
	return (
		<EmailSentInformationBox
			setRecaptchaErrorContext={() => {}}
			setRecaptchaErrorMessage={() => {}}
		/>
	);
};
Default.storyName = 'default';

export const ChangeEmail = () => {
	return (
		<EmailSentInformationBox
			setRecaptchaErrorContext={() => {}}
			setRecaptchaErrorMessage={() => {}}
			changeEmailPage="#"
		/>
	);
};
ChangeEmail.storyName = 'with changeEmailPage';

export const WithEmail = () => {
	return (
		<EmailSentInformationBox
			setRecaptchaErrorContext={() => {}}
			setRecaptchaErrorMessage={() => {}}
			changeEmailPage="#"
			email="test@example.com"
		/>
	);
};
WithEmail.storyName = 'with email';

export const WithResendEmailAction = () => {
	return (
		<EmailSentInformationBox
			setRecaptchaErrorContext={() => {}}
			setRecaptchaErrorMessage={() => {}}
			changeEmailPage="#"
			email="test@example.com"
			resendEmailAction="#"
		/>
	);
};
WithResendEmailAction.storyName = 'with resendEmailAction';

export const WithResendEmailActionNoChangeEmail = () => {
	return (
		<EmailSentInformationBox
			setRecaptchaErrorContext={() => {}}
			setRecaptchaErrorMessage={() => {}}
			email="test@example.com"
			resendEmailAction="#"
		/>
	);
};
WithResendEmailAction.storyName = 'with resendEmailActionNoChangeEmail';

export const WithNoAccountInfo = () => {
	return (
		<EmailSentInformationBox
			setRecaptchaErrorContext={() => {}}
			setRecaptchaErrorMessage={() => {}}
			changeEmailPage="#"
			email="test@example.com"
			resendEmailAction="#"
			noAccountInfo
		/>
	);
};
WithNoAccountInfo.storyName = 'with noAccountInfo';
