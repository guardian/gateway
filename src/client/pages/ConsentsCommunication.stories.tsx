import React from 'react';
import { Meta } from '@storybook/react';

import { ConsentsCommunication } from './ConsentsCommunication';
import {
  ClientStateProvider,
  defaultClientState,
} from '@/client/components/ClientState';

export default {
  title: 'Pages/ConsentsCommunication',
  component: ConsentsCommunication,
  parameters: { layout: 'fullscreen' },
} as Meta;

const consents = [
  {
    id: 'supporter',
    name: 'Supporting the Guardian',
    description:
      'Stay up-to-date with our latest offers and the aims of the organisation, as well as the ways to enjoy and support our journalism.',
  },
];

export const NoConsent = () => <ConsentsCommunication consents={[]} />;
NoConsent.story = {
  name: 'with no consents',
};

export const WithoutOptout = () => (
  <ConsentsCommunication consents={consents} />
);
WithoutOptout.story = {
  name: 'with consents',
};

export const WithSuccessMessage = () => (
  <ClientStateProvider
    clientState={{
      ...defaultClientState,
      globalMessage: { success: 'Some kind of success message' },
    }}
  >
    <ConsentsCommunication consents={consents} />
  </ClientStateProvider>
);
WithSuccessMessage.story = {
  name: 'with success message',
};

export const WithErrorMessage = () => (
  <ClientStateProvider
    clientState={{
      ...defaultClientState,
      globalMessage: { error: 'Some kind of error message' },
    }}
  >
    <ConsentsCommunication consents={consents} />
  </ClientStateProvider>
);
WithErrorMessage.story = {
  name: 'with error message',
};
