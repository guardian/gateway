import { Meta } from '@storybook/react';
import { PrintPromoSignUp } from './PrintPromoSignUp';
import { renderMJML } from '@/email/testUtils';

export default {
	title: 'Email/Templates/PrintPromoSignUp',
	component: PrintPromoSignUp,
	parameters: {
		chromatic: {
			modes: {
				'dark desktop': { disable: true },
				'dark mobile': { disable: true },
			},
		},
	},
} as Meta;

export const Default = () => {
	return renderMJML(<PrintPromoSignUp />);
};
Default.storyName = 'with defaults';
