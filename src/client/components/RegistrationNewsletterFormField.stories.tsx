import React from 'react';
import { Meta } from '@storybook/react';

import { RegistrationNewsletterFormField } from './RegistrationNewsletterFormField';

export default {
	title: 'Components/RegistrationNewsletterFormField',
	component: RegistrationNewsletterFormField,
} as Meta;

export const Default = () => {
	return <RegistrationNewsletterFormField />;
};
Default.storyName = 'default';

export const NativeApp = () => {
	return <RegistrationNewsletterFormField isNativeApp="android" />;
};
NativeApp.storyName = 'NativeApp';
