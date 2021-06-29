import React from 'react';
import { Meta } from '@storybook/react';

import { SubHeader } from './SubHeader';
import { renderMJMLComponent } from '../testUtils';

export default {
  title: 'Email/SubHeader',
  component: SubHeader,
} as Meta;

export const Default = () => {
  return renderMJMLComponent(<SubHeader>My subheader text</SubHeader>);
};
Default.storyName = 'Default sub header';
