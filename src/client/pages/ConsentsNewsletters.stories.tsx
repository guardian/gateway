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
        id: '4156',
        nameId: 'n0',
        description: 'Newsletter description',
        name: 'Newsletter Name',
        frequency: 'Weekly',
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
        nameId: 'green-light',
        description:
          'Exclusive articles from our top environment correspondents and a round up of the planet’s most important stories of the week',
        name: 'Down to Earth',
        frequency: 'Weekly',
      },
      {
        id: '4165',
        nameId: 'the-long-read',
        description:
          'Lose yourself in a great story: from politics to psychology, food to technology, culture to crime',
        name: 'The Long Read',
        frequency: 'Weekly',
      },
      {
        id: '9001',
        nameId: 'over-nine-thousand',
        description: '',
        name: 'No image',
        frequency: 'Monthly',
      },
    ]}
  />
);
MultipleNewsletter.story = {
  name: 'with multiple newsletters',
};
