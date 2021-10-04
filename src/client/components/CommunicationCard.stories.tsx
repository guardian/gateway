import React from 'react';
import { Meta } from '@storybook/react';

import { CommunicationCard } from './CommunicationCard';

export default {
  title: 'Components/CommunicationCard',
  component: CommunicationCard,
} as Meta;

export const Checked = () => (
  <CommunicationCard
    key="abc"
    title="Example consent"
    body="I do NOT wish to be contacted by the Guardian for market research purposes."
    value="abc"
    checked={true}
  />
);
Checked.storyName = 'When checked';

export const UnChecked = () => (
  <CommunicationCard
    key="abc"
    title="Example consent"
    body="I do NOT wish to be contacted by the Guardian for market research purposes."
    value="abc"
    checked={false}
  />
);
UnChecked.storyName = 'When unchecked';
