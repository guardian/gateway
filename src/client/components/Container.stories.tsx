import React from 'react';
import { css } from '@emotion/react';
import { Meta } from '@storybook/react';

import { Header } from '@/client/components/Header';
import { Container } from '@/client/components/Container';

export default {
	title: 'Components/Container',
	component: Container,
	parameters: { layout: 'fullscreen' },
} as Meta;

const Box = ({ children }: { children: React.ReactNode }) => (
	<div
		css={css`
			background-color: lightgrey;
			height: 200px;
			display: flex;
			align-items: center;
			justify-content: center;
		`}
	>
		{children}
	</div>
);

export const Default = () => (
	<>
		<Header />
		<Container>
			<Box>with defaults</Box>
		</Container>
	</>
);
Default.storyName = 'with defaults';
Default.parameters = {
	viewport: {
		defaultViewport: 'WIDE',
	},
};

export const SideBorders = () => (
	<>
		<Header />
		<Container sideBorders={true}>
			<Box>with side borders</Box>
		</Container>
	</>
);
SideBorders.storyName = 'with side borders';
SideBorders.parameters = {
	viewport: {
		defaultViewport: 'WIDE',
	},
};

export const TopBorder = () => (
	<>
		<Header />
		<Container topBorder={true} borderColor="hotpink">
			<Box>with pink top border</Box>
		</Container>
	</>
);
TopBorder.storyName = 'with pink top border';
TopBorder.parameters = {
	viewport: {
		defaultViewport: 'WIDE',
	},
};

export const BorderColour = () => (
	<>
		<Header />
		<Container sideBorders={true} borderColor="hotpink">
			<Box>with pink side borders</Box>
		</Container>
	</>
);
BorderColour.storyName = 'with pink side borders';
BorderColour.parameters = {
	viewport: {
		defaultViewport: 'WIDE',
	},
};

export const NoPadding = () => (
	<>
		<Header />
		<Container sideBorders={true} borderColor="hotpink" sidePadding={false}>
			<Box>with no padding</Box>
		</Container>
	</>
);
NoPadding.storyName = 'with no padding';
NoPadding.parameters = {
	viewport: {
		defaultViewport: 'WIDE',
	},
};

export const Mobile = () => (
	<>
		<Header />
		<Container>
			<Box>at mobile breakpoint</Box>
		</Container>
	</>
);
Mobile.storyName = 'at mobile breakpoint';
Mobile.parameters = {
	viewport: {
		defaultViewport: 'MOBILE',
	},
};
