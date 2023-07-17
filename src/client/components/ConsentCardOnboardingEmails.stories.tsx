import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { ConsentCardOnboarding } from './ConsentCardOnboardingEmails';

export default {
	title: 'Components/ConsentCardOnboarding',
	component: ConsentCardOnboarding,
} as ComponentMeta<typeof ConsentCardOnboarding>;

const Template: ComponentStory<typeof ConsentCardOnboarding> = ({
	id = '4147',
}) => <ConsentCardOnboarding id={id} />;

export const Default = Template.bind({});
Default.storyName = 'default';
