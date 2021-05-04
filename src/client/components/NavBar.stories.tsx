/* eslint-disable functional/immutable-data */
import React from 'react';
import { Meta } from '@storybook/react';

import { NavBar } from './NavBar';

export default {
  title: 'Components/NavBar',
  component: NavBar,
} as Meta;

export const Default = () => <NavBar />;
Default.storyName = 'Default navbar';
