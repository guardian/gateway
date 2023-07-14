import React from 'react';
import { Meta } from '@storybook/react';

import { UnvalidatedEmailResetPassword } from './UnvalidatedEmailResetPassword';
import { renderMJML } from '../../testUtils';

export default {
	title: 'Email/Templates/UnvalidatedEmailResetPassword',
	component: UnvalidatedEmailResetPassword,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => {
	return renderMJML(<UnvalidatedEmailResetPassword />);
};
Default.storyName = 'with defaults';
