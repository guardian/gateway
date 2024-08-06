import type { Meta } from '@storybook/react';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';
import { ToggleSwitchList } from '@/client/components/ToggleSwitchList';

export default {
	title: 'Components/ToggleSwitchList',
	component: ToggleSwitchList,
	parameters: {
		layout: 'padded',
	},
	args: {},
} as Meta<PropsWithChildren>;

// *****************************************************************************

export const WithOneSwitch = (props: PropsWithChildren) => (
	<ToggleSwitchList {...props}>
		<ToggleSwitchInput title="I'm pretty switched on." />
	</ToggleSwitchList>
);
WithOneSwitch.storyName = 'With one switch';

export const WithTwoSwitches = (props: PropsWithChildren) => (
	<ToggleSwitchList {...props}>
		<ToggleSwitchInput title="I'm pretty switched on." />
		<ToggleSwitchInput title="To switch or not to switch, that is the question. Whether 'tis switchier in the mind to suffer the switch and switch of switchy switching." />
	</ToggleSwitchList>
);
WithTwoSwitches.storyName = 'With two switches';
