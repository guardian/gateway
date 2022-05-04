import React from 'react';
import { Meta } from '@storybook/react';

import { JobsTerms } from './JobsTerms';

export default {
  title: 'Pages/JobsTerms',
  component: JobsTerms,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <JobsTerms />;
Default.story = {
  name: 'with defaults',
};
