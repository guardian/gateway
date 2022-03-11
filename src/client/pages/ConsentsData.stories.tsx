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

const Template: ComponentStory<typeof ConsentsData> = (props) => (
  <ConsentsData {...props} />
);

export const NoDescription = Template.bind({});
NoDescription.storyName = 'with no description';

export const ConsentedTrue = Template.bind({});
ConsentedTrue.args = {
  name: 'Allow the Guardian to analyse this data to improve marketing content',
  consented: true,
};
ConsentedTrue.storyName = 'with consented true';

export const ConsentedFalse = Template.bind({});
ConsentedFalse.args = {
  name: 'Allow the Guardian to analyse this data to improve marketing content',
  consented: false,
};
ConsentedFalse.storyName = 'with consented false';
