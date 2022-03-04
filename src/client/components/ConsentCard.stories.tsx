import React from 'react';
import { ComponentMeta, Story } from '@storybook/react';
import { news } from '@guardian/source-foundations';

import { DOWN_TO_EARTH_IMAGE } from '@/client/assets/newsletters';
import { ConsentCard } from './ConsentCard';

export default {
  title: 'Components/ConsentCard',
  component: ConsentCard,
} as ComponentMeta<typeof ConsentCard>;

type PartialProps = Partial<React.ComponentProps<typeof ConsentCard>>;
type ConsentCardStory = Story<PartialProps>;

const Template = (props: PartialProps) => (
  <ConsentCard
    title="Consent Name"
    description="Consent description"
    id="4147"
    imagePath={DOWN_TO_EARTH_IMAGE}
    {...props}
  />
);

export const Default: ConsentCardStory = Template.bind({});
Default.storyName = 'default';

export const Frequency: ConsentCardStory = Template.bind({});
Frequency.storyName = 'with email frequency';
Frequency.args = { frequency: 'Weekly' };

export const HighlightColor: ConsentCardStory = Template.bind({});
HighlightColor.storyName = 'with highlight color';
HighlightColor.args = { highlightColor: news[400] };

export const NoImage: ConsentCardStory = Template.bind({});
NoImage.storyName = 'when there is no image';
NoImage.args = { imagePath: undefined };
