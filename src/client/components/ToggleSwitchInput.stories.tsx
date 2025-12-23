import React from 'react';
import { Meta } from '@storybook/react';

import {
	ToggleSwitchInput,
	ToggleSwitchInputProps,
} from '@/client/components/ToggleSwitchInput';
import { SATURDAY_EDITION_SMALL_SQUARE_IMAGE } from '../assets/newsletters';

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

export const WithImage = (props: Partial<ToggleSwitchInputProps>) => (
	<ToggleSwitchInput
		title="A toggle switch with an image"
		description="A longer piece of descriptive text which can go over multiple lines, each more descriptive than the last."
		imagePath={SATURDAY_EDITION_SMALL_SQUARE_IMAGE}
		defaultChecked
		{...props}
	/>
);

WithImage.storyName = 'With image';
