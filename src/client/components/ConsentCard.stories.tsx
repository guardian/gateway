import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { news } from '@guardian/source-foundations';

import { DOWN_TO_EARTH_IMAGE } from '@/client/assets/newsletters';
import { ConsentCard } from './ConsentCard';

export default {
  title: 'Components/ConsentCard',
  component: ConsentCard,
} as ComponentMeta<typeof ConsentCard>;

const Template: ComponentStory<typeof ConsentCard> = ({
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
NoImage.args = { imagePath: undefined };
