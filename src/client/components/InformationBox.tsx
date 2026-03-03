import React, { PropsWithChildren } from 'react';
import { css } from '@emotion/react';
import {
	remSpace,
	textSans14,
	textSansBold14,
} from '@guardian/source/foundations';

const informationBoxStyles = css`
	background-color: var(--color-info-box-background);
	color: var(--color-info-box-text);
	border-radius: 4px;
	padding: ${remSpace[2]} ${remSpace[3]} ${remSpace[4]} ${remSpace[3]};
`;

const informationBoxTextStyle = (isGoogleOneTap?: boolean) => css`
	${textSans14};
	margin: 0 0 ${isGoogleOneTap ? 0 : remSpace[2]} 0;
	&:last-of-type {
		margin: 0;
	}

	a,
	button {
		${textSansBold14};
	}
`;

export const InformationBoxText = ({
	children,
	isGoogleOneTap,
}: {
	children: React.ReactNode;
	isGoogleOneTap?: boolean;
}) => <div css={informationBoxTextStyle(isGoogleOneTap)}>{children}</div>;

export const InformationBox = ({ children }: PropsWithChildren) => (
	<div css={informationBoxStyles}>{children}</div>
);
