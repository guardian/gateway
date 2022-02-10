import React from 'react';
import { Meta } from '@storybook/react';

import { CommunicationCard } from './CommunicationCard';
import image from '@/client/assets/supporter.png';

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
    image={image}
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
    image={image}
  />
);
UnChecked.storyName = 'When unchecked';
