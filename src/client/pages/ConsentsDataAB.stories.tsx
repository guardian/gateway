import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Consent } from '@/shared/model/Consent';
import { ConsentsDataAB } from './ConsentsDataAB';

export default {
  title: 'Pages/ConsentsDataAB',
  component: ConsentsDataAB,
  parameters: {
    layout: 'fullscreen',
    clientState: { pageData: { previousPage: 'fake_page' } },
  },
} as ComponentMeta<typeof ConsentsDataAB>;

const Template: ComponentStory<typeof ConsentsDataAB> = (props) => (
  <ConsentsDataAB {...props} />
);

const advertising: Consent = {
  id: 'personalised_advertising',
  name: 'Allow personalised advertising using this data - this supports the Guardian',
  consented: false,
};

const profiling: Consent = {
  id: 'profiling_optin',
  name: 'Allow the Guardian to analyse this data to improve marketing content',
  consented: true,
};

export const NoDescription = Template.bind({});
NoDescription.storyName = 'with no description';

export const ConsentedTrue = Template.bind({});
ConsentedTrue.args = {
  profiling: profiling,
  advertising: advertising,
};
ConsentedTrue.storyName = 'with consents';
