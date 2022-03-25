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
    optedIntoProfiling={false}
    productConsents={[]}
    subscribedNewsletters={[]}
    // @ABTEST
    optedIntoPersonalisedAdvertising={false}
    isUserInVariant={false}
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
    // @ABTEST
    optedIntoPersonalisedAdvertising={false}
    isUserInVariant={false}
  />
);
Profiling.story = {
  name: 'with consent given to profiling',
};

export const Newsletters = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedIntoProfiling={false}
    productConsents={[]}
    subscribedNewsletters={subscribedNewsletters}
    // @ABTEST
    optedIntoPersonalisedAdvertising={false}
    isUserInVariant={false}
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
    // @ABTEST
    optedIntoPersonalisedAdvertising={false}
    isUserInVariant={false}
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
    // @ABTEST
    optedIntoPersonalisedAdvertising={false}
    isUserInVariant={false}
  />
);
Everything.story = {
  name: 'with everything consented to',
};

export const InAdvertisingABTestConsented = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedIntoProfiling={true}
    productConsents={productConsents}
    subscribedNewsletters={subscribedNewsletters}
    // @ABTEST
    optedIntoPersonalisedAdvertising={true}
    isUserInVariant={true}
  />
);
InAdvertisingABTestConsented.story = {
  name: 'in AB test advertising consented',
};

export const InAdvertisingABTestNotConsented = () => (
  <ConsentsConfirmation
    returnUrl=""
    optedIntoProfiling={true}
    productConsents={productConsents}
    subscribedNewsletters={subscribedNewsletters}
    // @ABTEST
    optedIntoPersonalisedAdvertising={false}
    isUserInVariant={true}
  />
);
InAdvertisingABTestNotConsented.story = {
  name: 'in AB test advertising not consented',
};
