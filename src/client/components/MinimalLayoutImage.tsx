import React from 'react';
import {
	EMAIL_LIGHT,
	EMAIL_DARK,
	WELCOME_LIGHT,
	WELCOME_DARK,
	DecorativeImageId,
} from '@/client/assets/decorative';
import { css } from '@emotion/react';

interface Props {
	id: DecorativeImageId;
	isOnboardingFlow?: boolean;
}

const imageStyles = (id: DecorativeImageId, isOnboardingFlow?: boolean) => {
	const darkImage = id === 'email' ? EMAIL_DARK : WELCOME_DARK;
	const lightImage = id === 'email' ? EMAIL_LIGHT : WELCOME_LIGHT;

	return css`
		@media (prefers-color-scheme: dark) {
			content: url(${darkImage});
		}
		@media (prefers-color-scheme: light) {
			content: url(${isOnboardingFlow ? darkImage : lightImage});
		}

		/* These class-based themes are only for Storybook/Chromatic modes
     * (see preview.js). */
		html.dark-theme & {
			content: url(${darkImage});
		}
		html.light-theme & {
			content: url(${isOnboardingFlow ? darkImage : lightImage});
		}
	`;
};

export const MinimalLayoutImage = ({ id, isOnboardingFlow }: Props) => {
	// WCAG H67: Use null alt text for decorative images
	// ARIA: role="presentation" removes element from accessibility tree
	return (
		<img alt="" css={imageStyles(id, isOnboardingFlow)} role="presentation" />
	);
};
