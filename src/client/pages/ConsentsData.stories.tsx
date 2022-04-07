import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Consent } from '@/shared/model/Consent';
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

export const onlyProfilingConsent = Template.bind({});
onlyProfilingConsent.args = {
  profiling: profiling,
};
onlyProfilingConsent.storyName = 'with profiling consent only';

export const bothConsents = Template.bind({});
bothConsents.args = {
  profiling: profiling,
  advertising: advertising,
};
bothConsents.storyName = 'with both consents';
