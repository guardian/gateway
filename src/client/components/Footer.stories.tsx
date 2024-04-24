import React from 'react';
import { Meta } from '@storybook/react';
import { css } from '@emotion/react';

import { Footer } from '@/client/components/Footer';
import { getAutoRow, gridRow } from '@/client/styles/Grid';

export default {
	title: 'Components/Footer',
	component: Footer,
	parameters: { layout: 'fullscreen' },
} as Meta;

export const Desktop = () => <Footer />;
Desktop.storyName = 'At desktop';
Desktop.parameters = {
	viewport: {
		defaultViewport: 'DESKTOP',
	},
};

export const Mobile = () => <Footer />;
Mobile.storyName = 'At mobile';
Mobile.parameters = {
	viewport: {
		defaultViewport: 'MOBILE',
	},
};

export const Tablet = () => <Footer />;
Tablet.storyName = 'At tablet';
Tablet.parameters = {
	viewport: {
		defaultViewport: 'TABLET',
	},
};

export const Mobile320 = () => <Footer />;
Mobile320.storyName = 'At mobile 320';
Mobile320.parameters = {
	viewport: {
		defaultViewport: 'MOBILE_320',
	},
};

export const WithGrid = () => {
	const autoRow = getAutoRow();

	return (
		<>
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
			<Footer />
		</>
	);
};
