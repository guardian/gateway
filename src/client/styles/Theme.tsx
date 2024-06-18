import React from 'react';
import { Global, css } from '@emotion/react';
import { palette } from '@guardian/source/foundations';

const lightTheme = css`
	--color-background: ${palette.neutral[100]};
	--color-logo: ${palette.brand[400]};
	--color-heading: ${palette.brand[400]};
	--color-text: ${palette.neutral[7]};
	--color-strong-text: ${palette.brand[400]};
	--color-info-box-background: ${palette.neutral[93]};
	--color-info-box-text: ${palette.neutral[7]};
	--color-link: ${palette.brand[500]};
	--color-button-primary-border: ${palette.brand[400]};
	--color-button-primary-text: ${palette.neutral[100]};
	--color-button-primary-background: ${palette.brand[400]};
	--color-button-primary-background-hover: #234b8a; // Not a Source preset
	--color-button-secondary-border: ${palette.brand[400]};
	--color-button-secondary-text: ${palette.brand[400]};
	--color-button-secondary-background: ${palette.neutral[100]};
	--color-button-secondary-background-hover: ${palette.neutral[93]};
	--color-divider: #bcbcbc; // TODO: Change to Source preset when available
	--color-input-border: ${palette.neutral[46]};
	--color-input-background: ${palette.neutral[100]};
	--color-input-text: ${palette.brand[400]};
	--color-input-label: ${palette.brand[400]};
	--color-input-error: ${palette.error[400]};
	--color-input-success: ${palette.success[400]};
	--color-input-highlight: ${palette.neutral[97]};
	--color-toggle-inactive-background: ${palette.neutral[46]};
	--color-toggle-inactive-switch: ${palette.neutral[100]};
	--color-toggle-active-background: ${palette.success[400]};
	--color-toggle-active-switch: ${palette.neutral[100]};
	--color-toggle-text: ${palette.neutral[7]};
	--color-alert-info: ${palette.neutral[46]};
	--color-alert-error: ${palette.error[400]};
	--color-alert-success: ${palette.success[400]};
`;

const darkTheme = css`
	--color-background: ${palette.neutral[0]};
	--color-logo: ${palette.neutral[86]};
	--color-heading: ${palette.neutral[86]};
	--color-text: ${palette.neutral[86]};
	--color-strong-text: ${palette.neutral[86]};
	--color-info-box-background: ${palette.neutral[20]};
	--color-info-box-text: ${palette.neutral[86]};
	--color-link: ${palette.neutral[86]};
	--color-button-primary-border: ${palette.neutral[100]};
	--color-button-primary-text: ${palette.brand[400]};
	--color-button-primary-background: ${palette.neutral[100]};
	--color-button-primary-background-hover: ${palette.neutral[86]};
	--color-button-secondary-border: ${palette.neutral[60]};
	--color-button-secondary-text: ${palette.neutral[100]};
	--color-button-secondary-background: ${palette.neutral[0]};
	--color-button-secondary-background-hover: ${palette.neutral[20]};
	--color-divider: ${palette.neutral[38]};
	--color-input-border: ${palette.neutral[60]};
	--color-input-background: ${palette.neutral[0]};
	--color-input-text: ${palette.neutral[86]};
	--color-input-label: ${palette.neutral[86]};
	--color-input-error: ${palette.error[500]};
	--color-input-success: ${palette.success[500]};
	--color-input-highlight: ${palette.neutral[7]};
	--color-toggle-inactive-background: ${palette.neutral[60]};
	--color-toggle-inactive-switch: ${palette.neutral[0]};
	--color-toggle-active-background: ${palette.success[500]};
	--color-toggle-active-switch: ${palette.neutral[0]};
	--color-toggle-text: ${palette.neutral[86]};
	--color-alert-info: ${palette.neutral[60]};
	--color-alert-error: ${palette.error[500]};
	--color-alert-success: ${palette.success[500]};
`;

export const Theme = () => {
	return (
		<Global
			styles={css`
				:root {
					${lightTheme}
					@media (prefers-color-scheme: dark) {
						${darkTheme}
					}
				}

				/* These class-based themes are only for Storybook/Chromatic modes 
				 * (see preview.js).
				 */
				html.light-theme {
					${lightTheme}
				}
				html.dark-theme {
					${darkTheme}
				}

				body {
					background: var(--color-background);
				}
			`}
		/>
	);
};
