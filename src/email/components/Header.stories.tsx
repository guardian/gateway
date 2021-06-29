import React from 'react';
import { Meta } from '@storybook/react';

import { Header } from './Header';
import { renderMJMLComponent } from '../testUtils';

export default {
  title: 'Email/Components/Header',
  component: Header,
} as Meta;

export const Default = () => {
  return renderMJMLComponent(<Header />);
};
Default.storyName = 'Default header';
