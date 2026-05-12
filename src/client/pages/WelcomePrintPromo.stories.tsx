import { WelcomePrintPromo, WelcomePrintPromoProps } from './WelcomePrintPromo';
import { Meta } from '@storybook/preact';

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

export const Registering = (args: WelcomePrintPromoProps) => (
	<WelcomePrintPromo {...args} />
);

Registering.story = {
	name: 'when registering',
};
Default.story = {
	name: 'when signing in',
};
