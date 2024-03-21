import React, { PropsWithChildren } from 'react';
import { css } from '@emotion/react';
import { space, textSans } from '@guardian/source-foundations';

const informationBoxStyles = css`
	background-color: var(--color-info-box-background);
	color: var(--color-info-box-text);
	border-radius: 4px;
	padding: ${space[3]}px ${space[3]}px ${space[4]}px ${space[3]}px;
`;

const informationBoxTextStyle = css`
	${textSans.xsmall()};
	margin: 0 0 ${space[2]}px 0;
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
