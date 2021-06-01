import React from 'react';
import { Meta } from '@storybook/react';
import { getAutoRow } from '@/client/styles/Grid';
import { CONSENTS_PAGES } from '@/client/models/ConsentsPages';

import { ConsentsSubHeader } from './ConsentsSubHeader';

const confirmationSpanDefinition = {
  TABLET: {
    start: 2,
    span: 9,
  },
  DESKTOP: {
    start: 2,
    span: 8,
  },
  WIDE: {
    start: 3,
    span: 10,
  },
};
const autoRow = getAutoRow(1, confirmationSpanDefinition);

export default {
  title: 'Components/ConsentsSubHeader',
  component: ConsentsSubHeader,
} as Meta;

export const Default = () => (
  <ConsentsSubHeader autoRow={autoRow} title="My Title" />
);
Default.storyName = 'With defaults';

export const Contact = () => (
  <ConsentsSubHeader
    autoRow={autoRow}
    title="My Title"
    current={CONSENTS_PAGES.CONTACT}
  />
);
Contact.storyName = 'With Contact as current';

export const Newsletters = () => (
  <ConsentsSubHeader
    autoRow={autoRow}
    title="My Title"
    current={CONSENTS_PAGES.NEWSLETTERS}
  />
);
Newsletters.storyName = 'With Newsletters as current';

export const YourData = () => (
  <ConsentsSubHeader
    autoRow={autoRow}
    title="My Title"
    current={CONSENTS_PAGES.YOUR_DATA}
  />
);
YourData.storyName = 'With Your Data as current';

export const Review = () => (
  <ConsentsSubHeader
    autoRow={autoRow}
    title="My Title"
    current={CONSENTS_PAGES.REVIEW}
  />
);
YourData.storyName = 'With Review as current';
