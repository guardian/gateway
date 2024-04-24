import React from 'react';
import { Meta } from '@storybook/react';

import { MainBodyText } from '@/client/components/MainBodyText';

export default {
	title: 'Components/MainBodyText',
	component: MainBodyText,
} as Meta;

export const Default = () => (
	<MainBodyText>Here is some body text to use in the MainLayout.</MainBodyText>
);
Default.storyName = 'with Default';

export const NoMargin = () => (
	<MainBodyText noMarginBottom>
		Here is some body text to use in the MainLayout, with no margin bottom.
	</MainBodyText>
);
NoMargin.storyName = 'with NoMargin';

export const MarginTop = () => (
	<MainBodyText marginTop>
		Here is some body text to use in the MainLayout, with a margin top.
	</MainBodyText>
);
MarginTop.storyName = 'with MarginTop';

export const Paragraphs = () => (
	<>
		<MainBodyText>
			Here is some body text to use in the MainLayout.
		</MainBodyText>
		<MainBodyText marginTop>Here is some text with a margin top.</MainBodyText>
		<MainBodyText noMarginBottom>
			Here is some text with no margin bottom.
		</MainBodyText>
		<MainBodyText>
			Some more text here to make multiple paragraphs!
		</MainBodyText>
	</>
);
Paragraphs.storyName = 'with Paragraphs';
