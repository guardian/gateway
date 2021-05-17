import React from 'react';
import { Meta } from '@storybook/react';

import { SubHeader } from './SubHeader';

export default {
  title: 'Components/SubHeader',
  component: SubHeader,
} as Meta;

export const Default = () => <SubHeader title="Sub Header Title" />;
Default.storyName = 'with simple title';
