import React from 'react';
import { Meta } from '@storybook/react';

import { ABNewsletterCard } from './NewsletterCardAB';

export default {
  title: 'Components/ABNewsletterCard',
  component: ABNewsletterCard,
} as Meta;

export const Default = () => (
  <ABNewsletterCard
    newsletter={{
      id: '4147',
      nameId: 'n0',
      description: 'Newsletter description',
      name: 'Newsletter Name',
    }}
  />
);
Default.storyName = 'default';

export const Placeholder = () => (
  <ABNewsletterCard
    newsletter={{
      id: 'doesNotExist',
      nameId: 'n0',
      description: 'Newsletter description',
      name: 'Newsletter Name',
    }}
  />
);
Placeholder.storyName = 'when id is not matched';
