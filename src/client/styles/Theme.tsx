import React from 'react';
import { Global, css } from '@emotion/react';
import { palette } from '@guardian/source-foundations';

export const Theme = () => {
	return (
		<Global
			styles={css`
				:root {
					--color-background: ${palette.neutral[100]};
					--color-logo: ${palette.brand[400]};
					--color-heading: ${palette.brand[400]};
					--color-text: ${palette.neutral[10]};
					--color-info-box-background: ${palette.neutral[93]};
					--color-info-box-text: ${palette.neutral[10]};
					--color-link: ${palette.brand[500]};
					--color-button-primary-border: ${palette.brand[400]};
					--color-button-primary-text: ${palette.neutral[100]};
					--color-button-primary-background: ${palette.brand[400]};
					--color-button-primary-background-hover: ${palette.brand[500]};
					--color-button-secondary-border: ${palette.brand[400]};
					--color-button-secondary-text: ${palette.brand[400]};
					--color-button-secondary-background: ${palette.neutral[100]};
					--color-button-secondary-background-hover: ${palette.neutral[93]};
					--color-divider: ${palette.neutral[46]};
					--color-input-border: ${palette.neutral[46]};
					--color-input-background: ${palette.neutral[100]};
					--color-input-text: ${palette.brand[400]};
					--color-input-label: ${palette.brand[400]};
					--color-toggle-inactive-background: ${palette.neutral[46]};
					--color-toggle-inactive-switch: ${palette.neutral[100]};
					--color-toggle-active-background: ${palette.success[400]};
					--color-toggle-active-switch: ${palette.neutral[100]};
					--color-alert-info: ${palette.neutral[46]};
					--color-alert-error: ${palette.error[400]};
					--color-alert-success: ${palette.success[400]};

					@media (prefers-color-scheme: dark) {
						--color-background: ${palette.neutral[0]};
						--color-logo: ${palette.neutral[86]};
						--color-heading: ${palette.neutral[86]};
						--color-text: ${palette.neutral[86]};
						--color-info-box-background: ${palette.neutral[20]};
						--color-info-box-text: ${palette.neutral[86]};
						--color-link: ${palette.neutral[86]};
						--color-button-primary-border: ${palette.neutral[100]};
						--color-button-primary-text: ${palette.brand[400]};
						--color-button-primary-background: ${palette.neutral[100]};
						--color-button-primary-background-hover: ${palette.neutral[86]};
						--color-button-secondary-border: ${palette.neutral[100]};
						--color-button-secondary-text: ${palette.neutral[100]};
						--color-button-secondary-background: ${palette.neutral[0]};
						--color-button-secondary-background-hover: ${palette.neutral[20]};
						--color-divider: ${palette.neutral[46]};
						--color-input-border: ${palette.neutral[60]};
						--color-input-background: ${palette.neutral[0]};
						--color-input-text: ${palette.neutral[86]};
						--color-input-label: ${palette.neutral[86]};
						--color-toggle-inactive-background: ${palette.neutral[60]};
						--color-toggle-inactive-switch: ${palette.neutral[0]};
						--color-toggle-active-background: ${palette.success[400]};
						--color-toggle-active-switch: ${palette.neutral[0]};
						--color-alert-info: ${palette.neutral[60]};
						--color-alert-error: ${palette.error[500]};
						--color-alert-success: ${palette.success[500]};
					}
				}
				body {
					background: var(--color-background);
				}
			`}
		/>
	);
};
