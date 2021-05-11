import React from 'react';
import { Meta } from '@storybook/react';

import { ConsentsConfirmation } from './ConsentsConfirmation';

export default {
  title: 'Pages/ConsentsConfirmation',
  component: ConsentsConfirmation,
} as Meta;

export const NoConsent = () => (
  <ConsentsConfirmation
    returnUrl=""
    isUserInTest={false}
    optedOutOfMarketResearch={true}
    optedOutOfProfiling={true}
    productConsents={[]}
    subscribedNewsletters={[]}
  />
);
NoConsent.story = {
  name: 'with no consent given',
};

export const Profiling = () => (
  <ConsentsConfirmation
    returnUrl=""
    isUserInTest={false}
    optedOutOfMarketResearch={true}
    optedOutOfProfiling={false}
    productConsents={[]}
    subscribedNewsletters={[]}
  />
);
Profiling.story = {
  name: 'with consent given to profilling',
};

export const ProfilingMarketing = () => (
  <ConsentsConfirmation
    returnUrl=""
    isUserInTest={false}
    optedOutOfMarketResearch={false}
    optedOutOfProfiling={false}
    productConsents={[]}
    subscribedNewsletters={[]}
  />
);
ProfilingMarketing.story = {
  name: 'with consent given to profilling and marketing',
};

export const InTest = () => (
  <ConsentsConfirmation
    returnUrl=""
    isUserInTest={true}
    optedOutOfMarketResearch={false}
    optedOutOfProfiling={false}
    productConsents={[]}
    subscribedNewsletters={[]}
  />
);
InTest.story = {
  name: 'with consent given to profilling and marketing, inside test',
};

export const Newsletters = () => (
  <ConsentsConfirmation
    returnUrl=""
    isUserInTest={false}
    optedOutOfMarketResearch={true}
    optedOutOfProfiling={true}
    productConsents={[]}
    subscribedNewsletters={[
      {
        id: '',
        description: '',
        nameId: '',
        subscribed: true,
        name: 'Newsletter One',
      },
      {
        id: '',
        description: '',
        nameId: '',
        subscribed: true,
        name: 'Newsletter Two',
      },
    ]}
  />
);
Newsletters.story = {
  name: 'with two newsletters subscribed to',
};

export const Products = () => (
  <ConsentsConfirmation
    returnUrl=""
    isUserInTest={false}
    optedOutOfMarketResearch={true}
    optedOutOfProfiling={true}
    productConsents={[
      {
        id: '',
        description: '',
        consented: true,
        name: 'Product One',
      },
      {
        id: '',
        description: '',
        consented: true,
        name: 'Product Two',
      },
      {
        id: '',
        description: '',
        consented: true,
        name: 'Product Three',
      },
    ]}
    subscribedNewsletters={[]}
  />
);
Products.story = {
  name: 'with multiple products consented to',
};
