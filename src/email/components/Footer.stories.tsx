import React from 'react';
import { Meta } from '@storybook/react';

import { Footer } from './Footer';
import { renderMJMLComponent } from '../testUtils';

export default {
  title: 'Email/Components/Footer',
  component: Footer,
} as Meta;

export const Default = () => {
  return renderMJMLComponent(<Footer />);
};
Default.storyName = 'Default footer';
