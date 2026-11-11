import React from 'react';
import { WideHeaderLayout } from './WideHeaderLayout';
import { Meta } from '@storybook/preact';
import { MainBodyText } from '../components/MainBodyText';

export default {
	title: 'Layouts/WideHeaderLayout',
	component: WideHeaderLayout,
} as Meta;

const Paragraphs = () => (
	<>
		<MainBodyText>
			<strong>The Jabberwocky</strong>
		</MainBodyText>
		<MainBodyText>’Twas brillig, and the slithy toves</MainBodyText>
		<MainBodyText>Did gyre and gimble in the wabe;</MainBodyText>
		<MainBodyText>All mimsy were the borogoves,</MainBodyText>
		<MainBodyText>And the mome raths outgrabe.</MainBodyText>
	</>
);

export const Default = () => (
	<WideHeaderLayout>
		<Paragraphs />
	</WideHeaderLayout>
);
Default.storyName = 'Wide Header Layout';

export const WithHeader = () => (
	<WideHeaderLayout pageHeader="Welcome to the Wide Header Layout">
		<Paragraphs />
	</WideHeaderLayout>
);
WithHeader.storyName = 'Wide Header Layout with Header';

export const WithHeaderAndLeadText = () => (
	<WideHeaderLayout
		pageHeader="Welcome to the Wide Header Layout"
		leadText="This is the lead text for the wide header layout."
	>
		<Paragraphs />
	</WideHeaderLayout>
);
WithHeaderAndLeadText.storyName =
	'Wide Header Layout with Header and Lead Text';
