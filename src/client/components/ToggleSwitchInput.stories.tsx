import type { Meta } from '@storybook/react';
import React from 'react';
import type { ToggleSwitchInputProps } from '@/client/components/ToggleSwitchInput';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';

export default {
	title: 'Components/ToggleSwitchInput',
	component: ToggleSwitchInput,
	parameters: {
		layout: 'padded',
	},
	args: {},
} as Meta<ToggleSwitchInputProps>;

// *****************************************************************************

export const WithLabel = (props: Partial<ToggleSwitchInputProps>) => (
	<ToggleSwitchInput description={'I am a label'} {...props} />
);

WithLabel.storyName = 'Form switch with label';

export const Checked = (props: Partial<ToggleSwitchInputProps>) => (
	<ToggleSwitchInput description={'I am a label'} defaultChecked {...props} />
);

Checked.storyName = 'Checked by default';

export const WithLongLabel = (props: Partial<ToggleSwitchInputProps>) => (
	<ToggleSwitchInput
		description={
			"I am a label that is very long. This switch doesn't have a title. I should wrap if I get too long. How long can I get before I"
		}
		{...props}
	/>
);
WithLongLabel.storyName = 'With long label';

export const WithTitleAndDescription = (
	props: Partial<ToggleSwitchInputProps>,
) => (
	<ToggleSwitchInput
		title="To switch or not to switch, that is the question. Whether 'tis switchier in the mind to suffer the switch and switch of switchy switching."
		description="I am some additional context beneath the toggle switch and the label. I should wrap if I get too long."
		defaultChecked
		{...props}
	/>
);

WithTitleAndDescription.storyName = 'With title and description';
