import { css } from '@emotion/react';
import { from, remSpace, space } from '@guardian/source/foundations';
import { SECTION_GAP } from '@/client/models/Style';

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

// Fixed source divider expanding off the side of the container
export const divider = css`
	width: 100%;
	margin: ${remSpace[2]} 0 -${remSpace[1]} 0;
	background-color: var(--color-divider);
`;

export const errorContextLastTypeSpacing = css`
	margin-bottom: 0;
	&:last-child {
		margin-bottom: ${remSpace[3]};
	}
`;

export const errorContextSpacing = css`
	margin: 0;
	margin-top: ${space[2]}px;
`;

export const mainSectionStyles = css`
	display: flex;
	flex-direction: column;
	gap: ${SECTION_GAP};
`;

type ButtonWidth = 'full' | 'half';

const sharedButtonStyles = (width: ButtonWidth = 'full') => css`
	width: 100%;
	${from.tablet} {
		max-width: ${width === 'full' ? '100%' : '50%'};
	}
	margin: 0 auto;
	justify-content: center;
	:disabled {
		cursor: not-allowed;
	}
`;

export const primaryButtonStyles = (width: ButtonWidth = 'full') => css`
	${sharedButtonStyles(width)}
	background-color: var(--color-button-primary-background);
	border-color: var(--color-button-primary-border);
	color: var(--color-button-primary-text);
	&:hover {
		background-color: var(--color-button-primary-background-hover);
	}
`;

export const secondaryButtonStyles = (width: ButtonWidth = 'full') => css`
	${sharedButtonStyles(width)}
	background-color: var(--color-button-secondary-background);
	border-color: var(--color-button-secondary-border);
	color: var(--color-button-secondary-text);
	&:hover {
		background-color: var(--color-button-secondary-background-hover);
	}
`;

export const errorMessageStyles = css`
	border-color: var(--color-alert-error);
	color: var(--color-alert-error);
	div {
		color: var(--color-alert-error);
	}
	svg {
		fill: var(--color-alert-error) !important;
	}
	a {
		color: var(--color-alert-error);
	}
`;

export const successMessageStyles = css`
	border-color: var(--color-alert-success);
	color: var(--color-alert-success);
	div {
		color: var(--color-alert-success);
	}
	svg {
		fill: var(--color-alert-success) !important;
	}
	a {
		color: var(--color-alert-success);
	}
`;
