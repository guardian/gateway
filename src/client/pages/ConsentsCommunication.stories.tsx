import React from 'react';
import { Meta } from '@storybook/react';

import { ConsentsCommunication } from './ConsentsCommunication';

export default {
  title: 'Pages/ConsentsCommunication',
  component: ConsentsCommunication,
} as Meta;

export const NoConsent = () => (
  <ConsentsCommunication isUserInTest={false} consentsWithoutOptout={[]} />
);
NoConsent.story = {
  name: 'with no consents',
};

export const MarketResearch = () => (
  <ConsentsCommunication
    isUserInTest={false}
    marketResearchOptout={{
      id: '0',
      name: 'mr-name',
      description:
        'I do NOT wish to be contacted by The Guardian for market research purposes.',
    }}
    consentsWithoutOptout={[]}
  />
);
MarketResearch.story = {
  name: 'with market research consent',
};

export const WithoutOptout = () => (
  <ConsentsCommunication
    isUserInTest={false}
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
    isUserInTest={false}
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
    isUserInTest={false}
    marketResearchOptout={{
      id: '0',
      name: 'mr-name',
      description:
        'I do NOT wish to be contacted by The Guardian for market research purposes.',
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

export const InTest = () => (
  <ConsentsCommunication
    isUserInTest={true}
    marketResearchOptout={{
      id: '0',
      name: 'mr-name',
      description:
        'I do NOT wish to be contacted by The Guardian for market research purposes.',
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
InTest.story = {
  name: 'with user in test',
};
