import React from 'react';
import { Meta } from '@storybook/react';

import { ConsentsCommunication } from './ConsentsCommunication';

export default {
  title: 'Pages/ConsentsCommunication',
  component: ConsentsCommunication,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const NoConsent = () => (
  <ConsentsCommunication consentsWithoutOptout={[]} />
);
NoConsent.story = {
  name: 'with no consents',
};

export const MarketResearch = () => (
  <ConsentsCommunication
    marketResearchOptout={{
      id: '0',
      name: 'mr-name',
      description:
        'I do NOT wish to be contacted by the Guardian for market research purposes.',
    }}
    consentsWithoutOptout={[]}
  />
);
MarketResearch.story = {
  name: 'with market research consent',
};

export const WithoutOptout = () => (
  <ConsentsCommunication
    consentsWithoutOptout={[
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
    consentsWithoutOptout={[
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

export const MultipleConsentsAndMarketing = () => (
  <ConsentsCommunication
    marketResearchOptout={{
      id: '0',
      name: 'mr-name',
      description:
        'I do NOT wish to be contacted by the Guardian for market research purposes.',
    }}
    consentsWithoutOptout={[
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
MultipleConsentsAndMarketing.story = {
  name: 'with multiple consents and marketing',
};
