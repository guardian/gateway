import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { news } from '@guardian/source-foundations';

import { DOWN_TO_EARTH_IMAGE } from '@/client/assets/newsletters';
import { ConsentCard } from '@/client/components/ConsentCard';

export default {
	title: 'Components/ConsentCard',
	component: ConsentCard,
} as Meta<typeof ConsentCard>;

const Template: StoryFn<typeof ConsentCard> = ({
	title = 'Consent Name',
	description = 'Consent description',
	id = '4147',
	imagePath = DOWN_TO_EARTH_IMAGE,
	...otherProps
}) => (
	<ConsentCard
		title={title}
		description={description}
		id={id}
		imagePath={imagePath}
		{...otherProps}
	/>
);

export const Default = Template.bind({});
Default.storyName = 'default';

export const Frequency = Template.bind({});
Frequency.storyName = 'with email frequency';
Frequency.args = { frequency: 'Weekly' };

export const HighlightColor = Template.bind({});
HighlightColor.storyName = 'with highlight color';
HighlightColor.args = { highlightColor: news[400] };

export const NoImage = Template.bind({});
NoImage.storyName = 'when there is no image';
NoImage.args = { noImage: true };

export const FallbackImage = Template.bind({});
FallbackImage.storyName = 'when image path is invalid';
FallbackImage.args = { imagePath: '' };
