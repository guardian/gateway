import React from 'react';
import { Meta } from '@storybook/react';

import { RegistrationPasscode } from './RegistrationPasscode';
import { renderMJML } from '../../testUtils';

export default {
	title: 'Email/Templates/RegistrationPasscode',
	component: RegistrationPasscode,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => {
	return renderMJML(<RegistrationPasscode />);
};
Default.storyName = 'with defaults';
