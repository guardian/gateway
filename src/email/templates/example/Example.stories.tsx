import React from 'react';
import { Meta } from '@storybook/react';

import { Example } from './Example';
import { renderMJML } from '../../testUtils';

export default {
  title: 'Email/Templates/Example',
  component: Example,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => {
  return renderMJML(<Example />);
};
Default.storyName = 'with defaults';

export const Name = () => {
  return renderMJML(<Example name="Jane" />);
};
Name.storyName = 'with name';
