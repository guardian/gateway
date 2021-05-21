import React from 'react';
import { Meta } from '@storybook/react';

import { Example } from './Example';
import { renderMJML } from '../utility/render-mjml';

export default {
  title: 'Email/Example',
  component: Example,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => {
  return renderMJML(<Example />);
};
Default.storyName = 'Default email Example';
