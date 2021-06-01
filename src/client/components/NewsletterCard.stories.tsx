import React from 'react';
import { Meta } from '@storybook/react';

import { NewsletterCard } from './NewsletterCard';

export default {
  title: 'Components/NewsletterCard',
  component: NewsletterCard,
} as Meta;

export const Default = () => (
  <NewsletterCard
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
  <NewsletterCard
    newsletter={{
      id: 'doesNotExist',
      nameId: 'n0',
      description: 'Newsletter description',
      name: 'Newsletter Name',
    }}
  />
);
Placeholder.storyName = 'when id is not matched';
