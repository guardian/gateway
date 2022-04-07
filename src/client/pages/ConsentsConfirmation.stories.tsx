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

// TODO update these stories

export const None = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedIntoProfiling={false}
    productConsents={[]}
    subscribedNewsletters={[]}
    optedIntoPersonalisedAdvertising={false}
    shouldPersonalisedAdvertisingRender={false}
  />
);
None.story = {
  name: 'with no consents given',
};

export const Profiling = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedIntoProfiling={true}
    productConsents={[]}
    subscribedNewsletters={[]}
    optedIntoPersonalisedAdvertising={false}
    shouldPersonalisedAdvertisingRender={true}
  />
);
Profiling.story = {
  name: 'with consent given to profiling',
};

export const Advertising = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedIntoProfiling={false}
    productConsents={[]}
    subscribedNewsletters={[]}
    optedIntoPersonalisedAdvertising={true}
    shouldPersonalisedAdvertisingRender={true}
  />
);
Advertising.story = {
  name: 'with consent given to personalised advertising',
};

export const Data = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedIntoProfiling={true}
    productConsents={[]}
    subscribedNewsletters={[]}
    optedIntoPersonalisedAdvertising={true}
    shouldPersonalisedAdvertisingRender={true}
  />
);
Data.story = {
  name: 'with all data consents given',
};

export const Newsletters = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedIntoProfiling={false}
    productConsents={[]}
    subscribedNewsletters={subscribedNewsletters}
    optedIntoPersonalisedAdvertising={false}
    shouldPersonalisedAdvertisingRender={false}
  />
);
Newsletters.story = {
  name: 'with two newsletters subscribed to',
};

export const Products = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedIntoProfiling={false}
    productConsents={productConsents}
    subscribedNewsletters={[]}
    optedIntoPersonalisedAdvertising={false}
    shouldPersonalisedAdvertisingRender={false}
  />
);
Products.story = {
  name: 'with multiple products consented to',
};

export const Everything = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedIntoProfiling={true}
    productConsents={productConsents}
    subscribedNewsletters={subscribedNewsletters}
    optedIntoPersonalisedAdvertising={true}
    shouldPersonalisedAdvertisingRender={true}
  />
);
Everything.story = {
  name: 'with everything consented to',
};
