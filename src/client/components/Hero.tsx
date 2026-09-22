import React from 'react';

import { css } from '@emotion/react';
import { CONTAINER_GAP, LAYOUT_WIDTH_NARROW } from '../models/Style';
import { remSpace } from '@guardian/source/foundations';

export const heroStyles = css`
	width: 100%;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	// gap: ${CONTAINER_GAP};
	padding: ${remSpace[3]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	max-width: ${LAYOUT_WIDTH_NARROW}px;
`;

export const Hero = ({ children }: { children: React.ReactNode }) => (
	<div css={heroStyles}>{children}</div>
);
