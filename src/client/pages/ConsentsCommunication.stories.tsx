import React from 'react';
import { Meta } from '@storybook/react';

import { ConsentsCommunication } from './ConsentsCommunication';

export default {
  title: 'Pages/ConsentsCommunication',
  component: ConsentsCommunication,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const NoConsent = () => <ConsentsCommunication consents={[]} />;
NoConsent.story = {
  name: 'with no consents',
};

export const WithoutOptout = () => (
  <ConsentsCommunication
    consents={[
      {
        id: '0',
        name: 'My Consent Name',
        description: 'Consent description',
      },
    ]}
  />
);
WithoutOptout.story = {
  name: 'with consents',
};

export const MultipleConsents = () => (
  <ConsentsCommunication
    consents={[
      {
        id: '0',
        name: 'My Consent Name',
        description: 'Consent description',
      },
      {
        id: '1',
        name: 'My Other Consent Name',
        description: 'Other consent description',
      },
    ]}
  />
);
MultipleConsents.story = {
  name: 'with multiple consents',
};
