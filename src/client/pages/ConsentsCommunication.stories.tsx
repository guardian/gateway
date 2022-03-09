import React from 'react';
import { ComponentMeta, Story } from '@storybook/react';

import { ConsentsCommunication } from './ConsentsCommunication';

export default {
  title: 'Pages/ConsentsCommunication',
  component: ConsentsCommunication,
  parameters: {
    layout: 'fullscreen',
    clientState: { pageData: { previousPage: 'fake_page' } },
  },
} as ComponentMeta<typeof ConsentsCommunication>;

type PartialProps = Partial<React.ComponentProps<typeof ConsentsCommunication>>;

const consents = [
  {
    id: 'supporter',
    name: 'Supporting the Guardian',
    description:
      'Stay up-to-date with our latest offers and the aims of the organisation, as well as the ways to enjoy and support our journalism.',
  },
];

const Template: Story<PartialProps> = (props) => (
  <ConsentsCommunication consents={consents} {...props} />
);

export const NoConsent = Template.bind({});
NoConsent.args = { consents: [] };
NoConsent.storyName = 'with no consents';

export const WithConsent = Template.bind({});
WithConsent.storyName = 'with consents';

export const WithSuccessMessage = Template.bind({});
WithSuccessMessage.storyName = 'with success message';
WithSuccessMessage.parameters = {
  clientState: {
    globalMessage: { success: 'Some kind of success message' },
  },
};

export const WithErrorMessage = Template.bind({});
WithErrorMessage.storyName = 'with error message';
WithErrorMessage.parameters = {
  clientState: {
    globalMessage: { error: 'Some kind of error message' },
  },
};
