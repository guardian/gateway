import React from 'react';
import { Meta } from '@storybook/react';

import { JobsTermsAccept } from './JobsTermsAccept';

export default {
  title: 'Pages/JobsTermsAccept',
  component: JobsTermsAccept,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => <JobsTermsAccept submitUrl="/" />;
Default.story = {
  name: 'with defaults',
};
