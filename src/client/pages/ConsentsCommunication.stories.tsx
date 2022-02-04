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
        id: 'supporter',
        name: 'Supporting the Guardian',
        description:
          'Stay up-to-date with our latest offers and the aims of the organisation, as well as the ways to enjoy and support our journalism.',
      },
    ]}
  />
);
WithoutOptout.story = {
  name: 'with consents',
};
