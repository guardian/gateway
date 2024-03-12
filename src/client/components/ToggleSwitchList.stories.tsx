import React, { PropsWithChildren } from 'react';
import { Meta } from '@storybook/react';

import { ToggleSwitchList } from '@/client/components/ToggleSwitchList';
import { ToggleSwitchInput } from '@/client/components/ToggleSwitchInput';

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
