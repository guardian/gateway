import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { ConsentsData } from './ConsentsData';

export default {
  title: 'Pages/ConsentsData',
  component: ConsentsData,
  parameters: {
    layout: 'fullscreen',
    clientState: { pageData: { previousPage: 'fake_page' } },
  },
} as ComponentMeta<typeof ConsentsData>;

const Template: ComponentStory<typeof ConsentsData> = (args) => (
  <ConsentsData {...args} />
);

export const NoDescription = Template.bind({});
NoDescription.storyName = 'with no description';

export const ConsentedTrue = Template.bind({});
ConsentedTrue.args = {
  description:
    'I do NOT wish to be contacted by the Guardian for market research purposes.',
  consented: true,
};
ConsentedTrue.storyName = 'with consented true';

export const ConsentedFalse = Template.bind({});
ConsentedFalse.args = {
  description:
    'I do NOT wish to be contacted by the Guardian for market research purposes.',
  consented: false,
};
ConsentedFalse.storyName = 'with consented false';
