/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ConsentsFollowUp } from './ConsentsFollowUp';

export default {
  title: 'Pages/ConsentsFollowUp',
  component: ConsentsFollowUp,
} as Meta;

export const Defaults = () => (
  <ConsentsFollowUp newsletters={[]} consents={[]} />
);
Defaults.story = {
  name: 'with no entities',
};

export const NewsLetters = () => (
  <ConsentsFollowUp
    newsletters={[
      {
        id: '4165',
        nameId: 'n0',
        description: 'Newsletter description',
        name: 'Newsletter Name',
      },
    ]}
    consents={[]}
  />
);
NewsLetters.story = {
  name: 'with a single newsletter',
};

export const MultipleNewsLetters = () => (
  <ConsentsFollowUp
    newsletters={[
      {
        id: '4147',
        nameId: 'n0',
        description: 'Newsletter description',
        name: 'Newsletter Name',
      },
      {
        id: '4151',
        nameId: 'n1',
        description: 'Another newsletter description',
        name: 'Another Newsletter Name',
      },
    ]}
    consents={[]}
  />
);
MultipleNewsLetters.story = {
  name: 'with multiple newsletters',
};

export const MultipleConsents = () => (
  <ConsentsFollowUp
    newsletters={[]}
    consents={[
      {
        id: '0',
        description: 'Description for this consent',
        name: 'Consent name',
      },
      {
        id: '1',
        description: 'Description for another consent',
        name: 'Another consent name',
      },
    ]}
  />
);
MultipleConsents.story = {
  name: 'with multiple consents',
};

export const Consents = () => (
  <ConsentsFollowUp
    newsletters={[]}
    consents={[
      {
        id: '0',
        description: 'Description for this consent',
        name: 'Consent name',
      },
    ]}
  />
);
Consents.story = {
  name: 'with a single consent',
};

export const Both = () => (
  <ConsentsFollowUp
    newsletters={[
      {
        id: '4165',
        nameId: 'n0',
        description: 'Newsletter description',
        name: 'Newsletter Name',
      },
    ]}
    consents={[
      {
        id: '0',
        description: 'Description for this consent',
        name: 'Consent name',
      },
    ]}
  />
);
Both.story = {
  name: 'with both consents and newsletters having an item',
};
