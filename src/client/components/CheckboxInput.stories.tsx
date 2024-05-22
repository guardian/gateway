import React from 'react';
import { Meta } from '@storybook/react';
import { SATURDAY_EDITION_SMALL_SQUARE_IMAGE } from '../assets/newsletters';

import { CheckboxInput } from '@/client/components/CheckboxInput';

export default {
	title: 'Components/CheckboxInput',
	component: CheckboxInput,
} as Meta;

export const Default = () => <CheckboxInput label="A checkbox input field" />;
Default.storyName = 'with defaults';

export const WithDescription = () => (
	<CheckboxInput
		label="A checkbox input field"
		context="A longer piece of descriptive text which can go over multiple lines, each more descriptive than the last."
	/>
);
WithDescription.storyName = 'with description';

export const WithSubLabel = () => (
	<CheckboxInput label="A checkbox input field" subLabel="This is a sublabel" />
);
WithSubLabel.storyName = 'with sublabel';

export const KitchenSink = () => (
	<CheckboxInput
		label="A checkbox input field"
		context="A longer piece of descriptive text which can go over multiple lines, each more descriptive than the last."
		subLabel="This is a sublabel"
		defaultChecked
	/>
);
KitchenSink.storyName = 'with everything';

export const WithImage = () => (
	<CheckboxInput
		label="A checkbox input field"
		context="A longer piece of descriptive text which can go over multiple lines, each more descriptive than the last."
		subLabel="This is a sublabel"
		imagePath={SATURDAY_EDITION_SMALL_SQUARE_IMAGE}
	/>
);

WithImage.storyName = 'with image';
