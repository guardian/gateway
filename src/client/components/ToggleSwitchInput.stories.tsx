import React from 'react';
import { Meta } from '@storybook/react';

import { ToggleSwitchInput, ToggleSwitchInputProps } from './ToggleSwitchInput';

export default {
  title: 'Components/ToggleSwitchInput',
  component: ToggleSwitchInput,
  args: {},
} as Meta<ToggleSwitchInputProps>;

// *****************************************************************************

export const NoLabel = (props: Partial<ToggleSwitchInputProps>) => (
  <ToggleSwitchInput {...props} />
);
NoLabel.storyName = 'Default form switch';

// *****************************************************************************

export const WithLabel = (props: Partial<ToggleSwitchInputProps>) => (
  <ToggleSwitchInput label={'I am a label'} {...props} />
);

WithLabel.storyName = 'Form switch with label';

export const Checked = (props: Partial<ToggleSwitchInputProps>) => (
  <ToggleSwitchInput label={'I am a label'} defaultChecked {...props} />
);

Checked.storyName = 'Checked by default';
