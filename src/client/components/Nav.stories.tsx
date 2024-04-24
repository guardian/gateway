import React from 'react';
import { Meta } from '@storybook/react';

import { Header } from '@/client/components/Header';
import { Nav } from '@/client/components/Nav';
import { getAutoRow, gridRow } from '@/client/styles/Grid';
import { css } from '@emotion/react';

export default {
	title: 'Components/Nav',
	component: Nav,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Register = () => (
	<>
		<Header />
		<Nav
			tabs={[
				{
					displayText: 'Sign in',
					linkTo: '/signin',
					isActive: false,
				},
				{
					displayText: 'Register',
					linkTo: '/register',
					isActive: true,
				},
			]}
		/>
	</>
);
Register.storyName = 'with register active';

export const SignIn = () => (
	<>
		<Header />
		<Nav
			tabs={[
				{
					displayText: 'Sign in',
					linkTo: '/signin',
					isActive: true,
				},
				{
					displayText: 'Register',
					linkTo: '/register',
					isActive: false,
				},
			]}
		/>
	</>
);
SignIn.storyName = 'with signin active';
SignIn.parameters = {
	chromatic: { viewports: [480] },
};

export const Wide = () => (
	<>
		<Header />
		<Nav
			tabs={[
				{
					displayText: 'Sign in',
					linkTo: '/signin',
					isActive: true,
				},
				{
					displayText: 'Register',
					linkTo: '/register',
					isActive: false,
				},
			]}
		/>
	</>
);
Wide.storyName = 'at wide breakpoint';
Wide.parameters = {
	viewport: {
		defaultViewport: 'WIDE',
	},
	chromatic: { viewports: [1300] },
};

export const NoBreakpoint = () => (
	<>
		<Header />
		<Nav
			tabs={[
				{
					displayText: 'Sign in',
					linkTo: '/signin',
					isActive: true,
				},
				{
					displayText: 'Register',
					linkTo: '/register',
					isActive: false,
				},
			]}
		/>
	</>
);
NoBreakpoint.storyName = 'at full width';
NoBreakpoint.parameters = {
	viewport: {
		defaultViewport: 'does_not_exist',
	},
	chromatic: { disable: true },
};

export const WithGrid = () => {
	const autoRow = getAutoRow();

	return (
		<>
			<Header />
			<Nav
				tabs={[
					{
						displayText: 'Sign in',
						linkTo: '/signin',
						isActive: true,
					},
					{
						displayText: 'Register',
						linkTo: '/register',
						isActive: false,
					},
				]}
			/>
			<div
				css={[
					gridRow,
					css`
						margin: 0 auto;
					`,
				]}
			>
				<div css={[autoRow(), { backgroundColor: 'lightseagreen' }]}>
					This is an item in a grid
				</div>
				<div css={[autoRow(), { backgroundColor: 'lightsteelblue' }]}>
					This is another item in a grid, in another row
				</div>
			</div>
		</>
	);
};
WithGrid.storyName = 'with grid';
