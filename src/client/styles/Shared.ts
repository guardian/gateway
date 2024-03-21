import { css } from '@emotion/react';
import { remSpace, space } from '@guardian/source-foundations';

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

export const divider = css`
	// fixed source divider expanding off the side of the container
	width: 100%;
	margin: ${remSpace[2]} 0 0 0;
	background-color: var(--color-divider);
`;

export const errorContextSpacing = css`
	margin: 0;
	margin-top: ${space[2]}px;
`;

export const mainSectionStyles = css`
	display: flex;
	flex-direction: column;
	gap: ${remSpace[3]};
`;

export const primaryButtonStyles = css`
	width: 100%;
	justify-content: center;
	:disabled {
		cursor: not-allowed;
	}
	background-color: var(--color-button-primary-background);
	border-color: var(--color-button-primary-border);
	color: var(--color-button-primary-text);
	&:hover {
		background-color: var(--color-button-primary-background-hover);
	}
`;

export const secondaryButtonStyles = css`
	width: 100%;
	justify-content: center;
	background-color: var(--color-button-secondary-background);
	border-color: var(--color-button-secondary-border);
	color: var(--color-button-secondary-text);
	&:hover {
		background-color: var(--color-button-secondary-background-hover);
	}
`;
