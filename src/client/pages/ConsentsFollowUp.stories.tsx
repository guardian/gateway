/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ConsentsFollowUp } from './ConsentsFollowUp';

export default {
  title: 'Pages/ConsentsFollowUp',
  component: ConsentsFollowUp,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const NewsLetter = () => (
  <ConsentsFollowUp
    entityType="newsletter"
    entity={{
      id: '0',
      nameId: 'n0',
      description: 'Newsletter description',
      name: 'Newsletter Name',
    }}
  />
);
NewsLetter.story = {
  name: 'with newsletter',
};

export const Consent = () => (
  <ConsentsFollowUp
    entityType="consent"
    entity={{
      id: '0',
      description: 'Description for this consent',
      name: 'Consent name',
    }}
  />
);
Consent.story = {
  name: 'with consent',
};
