import React from 'react';
import { MinimalLayout, MinimalLayoutProps } from './MinimalLayout';
import {
	InformationBox,
	InformationBoxText,
} from '../components/InformationBox';

export default {
	title: 'Layout/Minimal',
	component: MinimalLayout,
	parameters: { layout: 'fullscreen' },
};

export const Default = (args: MinimalLayoutProps) => (
	<MinimalLayout {...args} />
);

Default.args = {
	pageHeader: 'A heading',
	pageSubText: 'One account to access all Guardian products.',
};

export const WithInfoBox = (args: MinimalLayoutProps) => (
	<MinimalLayout {...args}>
		<InformationBox>
			<InformationBoxText>This text is here to inform you.</InformationBoxText>
			<InformationBoxText>Consider yourself informed.</InformationBoxText>
		</InformationBox>
	</MinimalLayout>
);
WithInfoBox.storyName = 'with info box';

WithInfoBox.args = {
	pageHeader: 'A heading',
	pageSubText: 'One account to access all Guardian products.',
};
