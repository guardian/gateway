import React from 'react';
import { css } from '@emotion/react';
import { Meta } from '@storybook/react';

import { Header } from './Header';

export default {
  title: 'Components/Header',
  component: Header,
} as Meta;

export const Default = () => <Header />;
Default.storyName = 'Default navbar';

export const UsingOverrides = () => (
  <Header
    cssOverrides={css`
      background-color: hotpink;
    `}
  />
);
UsingOverrides.storyName = 'with css overridden';
