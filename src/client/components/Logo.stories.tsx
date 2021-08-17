import React from 'react';
import { Meta } from '@storybook/react';

import { Logo } from './Logo';

export default {
  title: 'Components/Logo',
  component: Logo,
  parameters: {
    backgrounds: {
      default: 'guardian',
      values: [{ name: 'guardian', value: '#052962' }],
    },
  },
} as Meta;

export const Default = () => <Logo />;
Default.storyName = 'default';

export const Anniversary = () => <Logo isAnniversary={true} />;
Anniversary.storyName = 'with isAnniversary true';
