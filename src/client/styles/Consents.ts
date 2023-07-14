import { css } from '@emotion/react';
import {
	space,
	headline,
	textSans,
	neutral,
	from,
} from '@guardian/source-foundations';

export const heading = css`
	color: ${neutral[0]};
	margin: 0 0 ${space[3]}px;
	${headline.xxxsmall({ fontWeight: 'bold' })};
`;

export const text = css`
	margin: 0;
	${textSans.medium()}
	max-width: 640px;
`;

export const subText = css`
	margin: 0;
	${textSans.small()}
`;

export const textBold = css`
	${text};
	font-weight: bold;
`;

const greyBorder = `1px solid ${neutral[86]}`;

export const greyBorderTop = css`
	border-top: ${greyBorder};
	padding-top: ${space[1]}px;
`;

export const greyBorderSides = css`
	margin: 0 auto;

	${from.tablet} {
		border-left: ${greyBorder};
		border-right: ${greyBorder};
	}
`;

export const passwordButton = css`
	width: 100%;
	justify-content: center;
`;

export const controls = css`
	padding: 22px 0 64px;
	${from.tablet} {
		padding-bottom: ${space[24]}px;
	}
`;

export const h1 = css`
	margin: ${space[6]}px 0 ${space[6]}px;
	${headline.small({ fontWeight: 'bold' })};
`;

// For some reason this media query only applies if we use a separate style
export const h1ResponsiveText = css`
	${from.tablet} {
		font-size: 32px;
	}

	${from.desktop} {
		margin-top: 30px;
	}
`;
