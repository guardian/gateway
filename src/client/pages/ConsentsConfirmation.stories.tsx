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
    optedOutOfProfiling={true}
    productConsents={[]}
    subscribedNewsletters={[]}
  />
);
None.story = {
  name: 'with no consents given',
};

export const Profiling = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedOutOfProfiling={false}
    productConsents={[]}
    subscribedNewsletters={[]}
  />
);
Profiling.story = {
  name: 'with consent given to profilling',
};

export const Newsletters = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedOutOfProfiling={true}
    productConsents={[]}
    subscribedNewsletters={subscribedNewsletters}
  />
);
Newsletters.story = {
  name: 'with two newsletters subscribed to',
};

export const Products = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedOutOfProfiling={true}
    productConsents={productConsents}
    subscribedNewsletters={[]}
  />
);
Products.story = {
  name: 'with multiple products consented to',
};

export const Everything = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedOutOfProfiling={false}
    productConsents={productConsents}
    subscribedNewsletters={subscribedNewsletters}
  />
);
Everything.story = {
  name: 'with everything consented to',
};
