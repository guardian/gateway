import { css } from '@emotion/react';
import { remSpace, textSans } from '@guardian/source/foundations';
import type { PropsWithChildren } from 'react';
import React from 'react';

const informationBoxStyles = css`
	background-color: var(--color-info-box-background);
	color: var(--color-info-box-text);
	border-radius: 4px;
	padding: ${remSpace[2]} ${remSpace[3]} ${remSpace[4]} ${remSpace[3]};
`;

const informationBoxTextStyle = css`
	${textSans.xsmall()};
	margin: 0 0 ${remSpace[2]} 0;
	&:last-of-type {
		margin: 0;
	}

	a,
	button {
		${textSans.xsmall({ fontWeight: 'bold' })};
	}
`;
export const InformationBoxText = ({
	children,
}: {
	children: React.ReactNode;
}) => <div css={informationBoxTextStyle}>{children}</div>;

export const InformationBox = ({ children }: PropsWithChildren) => (
	<div css={informationBoxStyles}>{children}</div>
);
