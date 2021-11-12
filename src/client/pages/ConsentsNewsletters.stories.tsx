/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ConsentsNewsletters } from './ConsentsNewsletters';

export default {
  title: 'Pages/ConsentsNewsletters',
  component: ConsentsNewsletters,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const NoNewsletters = () => <ConsentsNewsletters newsletters={[]} />;
NoNewsletters.story = {
  name: 'with no newsletters',
};

export const SingleNewsletter = () => (
  <ConsentsNewsletters
    newsletters={[
      {
        id: '4151',
        nameId: 'n0',
        description: 'Newsletter description',
        name: 'Newsletter Name',
      },
    ]}
  />
);
SingleNewsletter.story = {
  name: 'with a single newsletter',
};

export const MultipleNewsletter = () => (
  <ConsentsNewsletters
    newsletters={[
      {
        id: '4147',
        nameId: 'n0',
        description: 'Newsletter description',
        name: 'Newsletter Name',
      },
      {
        id: '4166',
        nameId: 'n1',
        description: 'Another newsletter description',
        name: 'Another Newsletter Name',
      },
    ]}
  />
);
MultipleNewsletter.story = {
  name: 'with multiple newsletters',
};
