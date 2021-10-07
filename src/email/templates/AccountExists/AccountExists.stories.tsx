import React from 'react';
import { Meta } from '@storybook/react';

import { AccountExists } from './AccountExists';
import { renderMJML } from '../../testUtils';

export default {
  title: 'Email/Templates/AccountExists',
  component: AccountExists,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Default = () => {
  return renderMJML(
    <AccountExists profileUrl="https://profile.theguardian.com" />,
  );
};
Default.storyName = 'with defaults';
