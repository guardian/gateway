import React from 'react';
import { css } from '@emotion/react';
import { Meta } from '@storybook/react';
import { brand } from '@guardian/source-foundations';

import { BackToTop } from '@/client/components/BackToTop';

export default {
	title: 'Components/BackToTop',
	component: BackToTop,
} as Meta;

export const Desktop = () => (
	<div
		css={css`
			background-color: ${brand[400]};
		`}
	>
		<BackToTop />
	</div>
);
Desktop.storyName = 'At Default';
