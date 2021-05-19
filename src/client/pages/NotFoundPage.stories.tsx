import React from 'react';
import { Meta } from '@storybook/react';

import { NotFoundPage } from './NotFoundPage';

export default {
  title: 'Pages/NotFoundPage',
  component: NotFoundPage,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <NotFoundPage />;
