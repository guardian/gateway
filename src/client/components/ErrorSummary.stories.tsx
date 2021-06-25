import React from 'react';
import { Meta } from '@storybook/react';

import { ErrorSummary } from './ErrorSummary';

export default {
  title: 'Components/ErrorSummary',
  component: ErrorSummary,
} as Meta;

export const Default = () => <ErrorSummary error="There has been an error" />;
Default.storyName = 'default';

export const WithContext = () => (
  <ErrorSummary
    error="There has been an error"
    context="Here's some more information about this error"
  />
);
WithContext.storyName = 'withContext';
