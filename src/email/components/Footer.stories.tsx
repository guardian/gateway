import React from 'react';
import { Meta } from '@storybook/preact';

import { Footer } from './Footer';
import { RenderMJML } from '../testUtils';

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
	return (
		<RenderMJML wrap={true}>
			<Footer />
		</RenderMJML>
	);
};
Default.storyName = 'Default footer';

export const MistakeParagraph = () => {
	return (
		<RenderMJML wrap={true}>
			<Footer
				mistakeParagraphComponent={
					<p>
						If you received this email by mistake, simply delete it. You
						won&apos;t be registered if you don&apos;t click the confirmation
						button above.
					</p>
				}
			/>
		</RenderMJML>
	);
};
MistakeParagraph.storyName = 'Mistake paragraph in footer';
