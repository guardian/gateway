import type { Meta } from '@storybook/react';
import React from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';

export default {
	title: 'Components/MainBodyText',
	component: MainBodyText,
	parameters: {
		layout: 'padded',
	},
} as Meta;

export const Default = () => (
	<>
		<MainBodyText>
			Here is some body text to use in the MinimalLayout.
		</MainBodyText>
		<MainBodyText>Here is some text.</MainBodyText>
		<MainBodyText>Here is some more text.</MainBodyText>
		<MainBodyText>
			Some more text here to make multiple paragraphs!
		</MainBodyText>
	</>
);
