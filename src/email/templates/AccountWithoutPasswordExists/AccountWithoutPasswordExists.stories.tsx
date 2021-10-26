import React from 'react';
import { Meta } from '@storybook/react';

import { AccountWithoutPasswordExists } from './AccountWithoutPasswordExists';
import { renderMJML } from '../../testUtils';

export default {
  title: 'Email/Templates/AccountWithoutPasswordExists',
  component: AccountWithoutPasswordExists,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => {
  return renderMJML(<AccountWithoutPasswordExists />);
};
Default.storyName = 'with defaults';
