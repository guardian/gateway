import React from 'react';
import { Meta } from '@storybook/react';

import { EnvelopeImage } from '@/client/components/EnvelopeImage';

export default {
	title: 'Components/EnvelopeImage',
	component: EnvelopeImage,
} as Meta;

export const Default = () => <EnvelopeImage />;
Default.storyName = 'default';

export const Inverted = () => <EnvelopeImage invertColors={true} />;
Inverted.storyName = 'when inverted';

export const Smaller = () => <EnvelopeImage width="200" />;
Smaller.storyName = 'with width';
