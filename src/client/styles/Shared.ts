import { css } from '@emotion/react';
import { palette, space, textSans } from '@guardian/source-foundations';

export const disableAutofillBackground = css`
	:-webkit-autofill {
		background-color: transparent !important;
		box-shadow: 0 0 0 50px white inset;
	}
	:autofill {
		background-color: transparent !important;
		box-shadow: 0 0 0 50px white inset;
	}
`;

export const socialButtonDivider = css`
	/* Undoes the negative margin */
	margin-bottom: ${space[5]}px;
	margin-top: ${space[5]}px;
	color: ${palette.neutral[10]};
	:before,
	:after {
		content: '';
		flex: 1 1;
		border-bottom: 1px solid ${palette.neutral[10]};
		margin: 8px;
	}
	@media (prefers-color-scheme: dark) {
		color: ${palette.neutral[46]};
	}
`;

// fixed source divider expanding off the side of the container
export const divider = css`
	margin-left: 0;
	width: 100%;
`;

export const errorContextSpacing = css`
	margin: 0;
	margin-top: ${space[2]}px;
`;

export const mainTextStyles = css`
	${textSans.small()};
`;
