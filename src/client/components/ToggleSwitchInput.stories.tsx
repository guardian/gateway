import React from 'react';
import { Meta } from '@storybook/react';

import {
	ToggleSwitchInput,
	ToggleSwitchInputProps,
} from '@/client/components/ToggleSwitchInput';
import { SATURDAY_EDITION_SMALL_SQUARE_IMAGE } from '@/client/assets/newsletters';

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

export const WithContextAndLabel = (props: Partial<ToggleSwitchInputProps>) => (
	<ToggleSwitchInput
		label={'I am a label'}
		context="I am some additional context beneath the toggle switch and the label. I should wrap if I get too long."
		defaultChecked
		{...props}
	/>
);

WithContextAndLabel.storyName = 'With label and context';

export const WithContextLabelImage = (
	props: Partial<ToggleSwitchInputProps>,
) => (
	<ToggleSwitchInput
		label={'I am a label'}
		context="I am some additional context beneath the toggle switch and the label. I should wrap if I get too long."
		imagePath={SATURDAY_EDITION_SMALL_SQUARE_IMAGE}
		defaultChecked
		{...props}
	/>
);

WithContextLabelImage.storyName = 'With label, context, image';
