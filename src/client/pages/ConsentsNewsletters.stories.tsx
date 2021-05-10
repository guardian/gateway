/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ConsentsNewsletters } from './ConsentsNewsletters';

export default {
  title: 'Pages/ConsentsNewsletters',
  component: ConsentsNewsletters,
} as Meta;

export const NoNewsletters = () => (
  <ConsentsNewsletters newsletters={[]} isUserInTest={false} />
);
NoNewsletters.story = {
  name: 'with no newsletters',
};

export const NoNewslettersInTest = () => (
  <ConsentsNewsletters newsletters={[]} isUserInTest={true} />
);
NoNewslettersInTest.story = {
  name: 'with no newsletters, in test',
};

export const SingleNewsletter = () => (
  <ConsentsNewsletters
    newsletters={[
      {
        id: '0',
        nameId: 'n0',
        description: 'Newsletter description',
        name: 'Newsletter Name',
      },
    ]}
    isUserInTest={false}
  />
);
SingleNewsletter.story = {
  name: 'with a single newsletter',
};

export const SingleNewsletterInTest = () => (
  <ConsentsNewsletters
    newsletters={[
      {
        id: '0',
        nameId: 'n0',
        description: 'Newsletter description',
        name: 'Newsletter Name',
      },
    ]}
    isUserInTest={true}
  />
);
SingleNewsletterInTest.story = {
  name: 'with a single newsletter, in test',
};

export const MultipleNewsletter = () => (
  <ConsentsNewsletters
    newsletters={[
      {
        id: '0',
        nameId: 'n0',
        description: 'Newsletter description',
        name: 'Newsletter Name',
      },
      {
        id: '1',
        nameId: 'n1',
        description: 'Another newsletter description',
        name: 'Another Newsletter Name',
      },
    ]}
    isUserInTest={false}
  />
);
MultipleNewsletter.story = {
  name: 'with multiple newsletters',
};

export const MultipleNewslettersInTest = () => (
  <ConsentsNewsletters
    newsletters={[
      {
        id: '0',
        nameId: 'n0',
        description: 'Newsletter description',
        name: 'Newsletter Name',
      },
      {
        id: '1',
        nameId: 'n1',
        description: 'Another newsletter description',
        name: 'Another Newsletter Name',
      },
    ]}
    isUserInTest={true}
  />
);
MultipleNewslettersInTest.story = {
  name: 'with multiple newsletters, in test',
};
