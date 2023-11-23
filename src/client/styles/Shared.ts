import { css } from '@emotion/react';
import { border, from, space } from '@guardian/source-foundations';

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
	margin-bottom: ${space[4]}px;
	margin-top: ${space[4]}px;
	${from.mobileMedium} {
		margin-top: ${space[6]}px;
		margin-bottom: ${space[6]}px;
	}
	:before,
	:after {
		content: '';
		flex: 1 1;
		border-bottom: 1px solid ${border.secondary};
		margin: 8px;
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
