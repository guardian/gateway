/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ConsentsData } from './ConsentsData';

export default {
  title: 'Pages/ConsentsData',
  component: ConsentsData,
} as Meta;

export const Default = () => <ConsentsData />;
Default.story = {
  name: 'with defaults',
};

export const NoDescription = () => <ConsentsData consented={true} />;
NoDescription.story = {
  name: 'with consented true',
};

export const Description = () => (
  <ConsentsData consented={true} description="Some description" />
);
Description.story = {
  name: 'with description',
};

export const LongDescription = () => (
  <ConsentsData
    consented={false}
    description="I'm baby disrupt 3 wolf moon stumptown DIY slow-carb organic. 90's messenger bag cray, portland meggings ennui next level salvia man bun humblebrag tote bag. Green juice yr edison bulb, hell of cloud bread raclette keffiyeh kinfolk. Woke williamsburg cred fanny pack selfies."
  />
);
LongDescription.story = {
  name: 'with long description',
};
