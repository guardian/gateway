/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { ConsentsData } from './ConsentsData';

export default {
  title: 'Pages/ConsentsData',
  component: ConsentsData,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const NoDescription = () => <ConsentsData />;
NoDescription.story = {
  name: 'with no description',
};

export const ConsentedTrue = () => (
  <ConsentsData
    name="Allow the Guardian to analyse this data to improve marketing content"
    consented={true}
  />
);
ConsentedTrue.story = {
  name: 'with consented true',
};

export const ConsentedFalse = () => (
  <ConsentsData
    name="Allow the Guardian to analyse this data to improve marketing content"
    consented={false}
  />
);
ConsentedFalse.story = {
  name: 'with consented false',
};
