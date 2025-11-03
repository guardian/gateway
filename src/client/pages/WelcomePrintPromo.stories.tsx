import { WelcomePrintPromo, WelcomePrintPromoProps } from './WelcomePrintPromo';
import { Meta } from '@storybook/react';

export default {
	title: 'Pages/WelcomePrintPromo',
	component: WelcomePrintPromo,
	args: {
		shortRequestId: 'ABC123',
		continueLink: 'https://www.theguardian.com/uk',
	},
} as Meta;

export const Default = (args: WelcomePrintPromoProps) => (
	<WelcomePrintPromo {...args} />
);
Default.story = {
	name: 'default',
};
