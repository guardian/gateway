/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';
import { ClientStateProvider } from '@/client/components/ClientState';
import { Consents } from '@/shared/model/Consent';

import { ConsentsConfirmationPage as ConsentsConfirmation } from './ConsentsConfirmation';

export default {
  title: 'Pages/ConsentsConfirmation',
  component: ConsentsConfirmation,
} as Meta;

export const NoConsent = () => (
  <ClientStateProvider
    clientState={{
      clientHosts: { idapiBaseUrl: '' },
      pageData: {
        consents: [],
      },
    }}
  >
    <ConsentsConfirmation />
  </ClientStateProvider>
);
NoConsent.story = {
  name: 'with no consent given',
};

export const Profiling = () => (
  <ClientStateProvider
    clientState={{
      clientHosts: { idapiBaseUrl: '' },
      pageData: {
        consents: [
          {
            id: Consents.PROFILING,
            name: '',
            description: '',
          },
        ],
      },
    }}
  >
    <ConsentsConfirmation />
  </ClientStateProvider>
);
Profiling.story = {
  name: 'with consent given to profilling',
};

export const ProfilingMarketing = () => (
  <ClientStateProvider
    clientState={{
      clientHosts: { idapiBaseUrl: '' },
      pageData: {
        consents: [
          {
            id: Consents.PROFILING,
            name: '',
            description: '',
          },
          {
            id: Consents.MARKET_RESEARCH,
            name: '',
            description: '',
          },
        ],
      },
    }}
  >
    <ConsentsConfirmation />
  </ClientStateProvider>
);
ProfilingMarketing.story = {
  name: 'with consent given to profilling and marketing',
};

export const Newsletters = () => (
  <ClientStateProvider
    clientState={{
      clientHosts: { idapiBaseUrl: '' },
      pageData: {
        newsletters: [
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
        ],
      },
    }}
  >
    <ConsentsConfirmation />
  </ClientStateProvider>
);
Newsletters.story = {
  name: 'with two newsletters subscribed to',
};

export const Products = () => (
  <ClientStateProvider
    clientState={{
      clientHosts: { idapiBaseUrl: '' },
      pageData: {
        consents: [
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
        ],
      },
    }}
  >
    <ConsentsConfirmation />
  </ClientStateProvider>
);
Products.story = {
  name: 'with multiple products consented to',
};
