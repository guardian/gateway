/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { NotFound } from './NotFound';

export default {
  title: 'Pages/NotFound',
  component: NotFound,
} as Meta;

export const Default = () => <NotFound />;
Default.parameters = {
  viewport: {
    defaultViewport: 'mobileMedium',
  },
};
