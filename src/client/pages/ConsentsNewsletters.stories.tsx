import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { ConsentsNewsletters } from './ConsentsNewsletters';

export default {
  title: 'Pages/ConsentsNewsletters',
  component: ConsentsNewsletters,
  parameters: {
    layout: 'fullscreen',
    clientState: { pageData: { previousPage: 'fake_page' } },
  },
} as ComponentMeta<typeof ConsentsNewsletters>;

const Template: ComponentStory<typeof ConsentsNewsletters> = (props) => (
  <ConsentsNewsletters {...props} />
);

const newsletters = [
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
];

export const NoNewsletters = Template.bind({});
NoNewsletters.args = { consents: [] };
NoNewsletters.storyName = 'with no newsletters';

export const SingleNewsletter = Template.bind({});
SingleNewsletter.args = {
  consents: [
    {
      type: 'newsletter',
      consent: {
        id: '4156',
        nameId: 'n0',
        description: 'Newsletter description',
        name: 'Newsletter Name',
        frequency: 'Weekly',
      },
    },
  ],
};
SingleNewsletter.storyName = 'with a single newsletter';

export const MultipleNewsletter = Template.bind({});
MultipleNewsletter.args = {
  consents: newsletters.map((newsletter) => ({
    type: 'newsletter',
    consent: newsletter,
  })),
};
MultipleNewsletter.storyName = 'with multiple newsletters';

export const NewslettersAndEvents = Template.bind({});
NewslettersAndEvents.args = {
  consents: [
    ...newsletters.map((newsletter) => ({
      type: 'newsletter' as const,
      consent: newsletter,
    })),
    {
      type: 'consent' as const,
      consent: {
        id: 'events',
        name: 'Events & Masterclasses',
        description:
          'Receive weekly newsletters about our upcoming Live events and Masterclasses. Interact with leading minds and nourish your curiosity in our immersive online events, available worldwide.',
      },
    },
  ],
};
NewslettersAndEvents.storyName = 'with newsletters and consent for events';
