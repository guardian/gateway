import type { Meta } from '@storybook/react';
import React from 'react';
import { renderMJMLComponent } from '../testUtils';
import { Footer } from './Footer';

export default {
	title: 'Email/Components/Footer',
	component: Footer,
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
	return renderMJMLComponent(<Footer />);
};
Default.storyName = 'Default footer';

export const MistakeParagraph = () => {
	return renderMJMLComponent(
		<Footer
			mistakeParagraphComponent={
				<p>
					If you received this email by mistake, simply delete it. You
					won&apos;t be registered if you don&apos;t click the confirmation
					button above.
				</p>
			}
		/>,
	);
};
MistakeParagraph.storyName = 'Mistake paragraph in footer';
