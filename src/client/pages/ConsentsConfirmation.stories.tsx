import React from 'react';
import { Meta } from '@storybook/react';

import { ConsentsConfirmation } from './ConsentsConfirmation';

export default {
  title: 'Pages/ConsentsConfirmation',
  component: ConsentsConfirmation,
  parameters: { layout: 'fullscreen' },
} as Meta;

const productConsents = [
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
];
const subscribedNewsletters = [
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
];

export const None = () => (
  <ConsentsConfirmation
    returnUrl=""
    productConsents={[]}
    subscribedNewsletters={[]}
    optedIntoProfiling={false}
    optedIntoPersonalisedAdvertising={false}
  />
);
None.story = {
  name: 'with no consents given',
};

export const Profiling = () => (
  <ConsentsConfirmation
    returnUrl=""
    productConsents={[]}
    subscribedNewsletters={[]}
    optedIntoProfiling={true}
    optedIntoPersonalisedAdvertising={false}
  />
);
Profiling.story = {
  name: 'with consent given to profiling',
};

// TODO FIXME this view is broken
export const Advertising = () => (
  <ConsentsConfirmation
    returnUrl=""
    productConsents={[]}
    subscribedNewsletters={[]}
    optedIntoProfiling={false}
    optedIntoPersonalisedAdvertising={true}
  />
);
Advertising.story = {
  name: 'with consent given to personalised advertising',
};

export const Data = () => (
  <ConsentsConfirmation
    returnUrl=""
    productConsents={[]}
    subscribedNewsletters={[]}
    optedIntoProfiling={true}
    optedIntoPersonalisedAdvertising={true}
  />
);
Data.story = {
  name: 'with all data consents given',
};

export const Newsletters = () => (
  <ConsentsConfirmation
    returnUrl=""
    productConsents={[]}
    subscribedNewsletters={subscribedNewsletters}
    optedIntoProfiling={false}
    optedIntoPersonalisedAdvertising={false}
  />
);
Newsletters.story = {
  name: 'with two newsletters subscribed to',
};

export const Products = () => (
  <ConsentsConfirmation
    returnUrl=""
    productConsents={productConsents}
    subscribedNewsletters={[]}
    optedIntoProfiling={false}
    optedIntoPersonalisedAdvertising={false}
  />
);
Products.story = {
  name: 'with multiple products consented to',
};

export const Everything = () => (
  <ConsentsConfirmation
    returnUrl=""
    productConsents={productConsents}
    subscribedNewsletters={subscribedNewsletters}
    optedIntoProfiling={true}
    optedIntoPersonalisedAdvertising={true}
  />
);
Everything.story = {
  name: 'with everything consented to',
};
