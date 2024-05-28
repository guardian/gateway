import React, { PropsWithChildren } from 'react';
import { css } from '@emotion/react';
import { palette, space, textSans } from '@guardian/source/foundations';

interface InformationBoxProps {
	withMarginTop?: boolean;
}

const informationBoxStyles = ({ withMarginTop }: InformationBoxProps) => css`
	background-color: ${palette.neutral[93]};
	border-radius: 4px;
	padding: ${space[3]}px ${space[3]}px;
	${withMarginTop && `margin-top: ${space[5]}px;`}
`;

const informationBoxTextStyle = css`
	${textSans.xsmall()}
	margin: 0 0 ${space[2]}px 0;
	&:last-of-type {
		margin: 0;
	}

	a {
		${textSans.xsmall()}
	}

	button {
		${textSans.xsmall()}
	}
`;
export const InformationBoxText = ({
	children,
}: {
	children: React.ReactNode;
}) => <div css={informationBoxTextStyle}>{children}</div>;

export const InformationBox = ({
	children,
	withMarginTop,
}: PropsWithChildren<InformationBoxProps>) => (
	<div css={informationBoxStyles({ withMarginTop })}>{children}</div>
);
