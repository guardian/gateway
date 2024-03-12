import { css } from '@emotion/react';
import { from } from '@guardian/source/foundations';
import React, { PropsWithChildren } from 'react';
import { SECTION_GAP } from '@/client/models/Style';

const containerStyles = (columns: 1 | 2) => css`
	display: grid;
	gap: ${SECTION_GAP};

	grid-template-columns: 1fr;
	${columns === 2 &&
	`
	${from.tablet} {
		grid-template-columns: repeat(2, 1fr);
	}`};
`;

interface Props extends PropsWithChildren {
	columns?: 1 | 2;
}

export const ToggleSwitchList = ({ children, columns = 1 }: Props) => {
	return <div css={containerStyles(columns)}>{children}</div>;
};
