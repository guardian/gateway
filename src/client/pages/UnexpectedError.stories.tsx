/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { UnexpectedError } from './UnexpectedError';

export default {
  title: 'Pages/UnexpectedError',
  component: UnexpectedError,
} as Meta;

export const Default = () => <UnexpectedError />;
