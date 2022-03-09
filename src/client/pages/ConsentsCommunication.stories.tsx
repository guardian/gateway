import React from 'react';
import { ComponentMeta, Story, DecoratorFn } from '@storybook/react';

import { ConsentsCommunication } from './ConsentsCommunication';
import {
  ClientStateProvider,
  defaultClientState,
} from '@/client/components/ClientState';

const clientStateDecorator: DecoratorFn = (StoryToDecorate, context) => (
  <ClientStateProvider
    clientState={{
      ...defaultClientState,
      ...context.parameters.clientState,
    }}
  >
    <StoryToDecorate />
  </ClientStateProvider>
);

export default {
  title: 'Pages/ConsentsCommunication',
  component: ConsentsCommunication,
  parameters: { layout: 'fullscreen' },
  decorators: [clientStateDecorator],
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

// export const NoConsent = Template.bind({});
// NoConsent.args = { consents: [] };
// NoConsent.storyName = 'with no consents';

// export const WithConsent = Template.bind({});
// WithConsent.storyName = 'with consents';

// export const WithSuccessMessage = () => (
//   <ClientStateProvider
//     clientState={{
//       ...defaultClientState,
//       globalMessage: { success: 'Some kind of success message' },
//     }}
//   >
//     <ConsentsCommunication consents={consents} />
//   </ClientStateProvider>
// );
// WithSuccessMessage.story = {
//   name: 'with success message',
// };

// export const WithErrorMessage = () => (
//   <ClientStateProvider
//     clientState={{
//       ...defaultClientState,
//       globalMessage: { error: 'Some kind of error message' },
//     }}
//   >
//     <ConsentsCommunication consents={consents} />
//   </ClientStateProvider>
// );
// WithErrorMessage.story = {
//   name: 'with error message',
// };

export const Test = Template.bind({});
Test.parameters = {
  clientState: {
    globalMessage: { error: 'Some kind of error message' },
  },
};
Test.storyName = 'test';
