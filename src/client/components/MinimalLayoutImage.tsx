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
	useDarkImage?: boolean;
}

const imageStyles = (id: DecorativeImageId, useDarkImage?: boolean) => {
	const darkImage = id === 'email' ? EMAIL_DARK : WELCOME_DARK;
	// Required for dark blue background header.
	const lightImage = useDarkImage
		? darkImage
		: id === 'email'
			? EMAIL_LIGHT
			: WELCOME_LIGHT;

	return css`
		@media (prefers-color-scheme: dark) {
			content: url(${darkImage});
		}
		@media (prefers-color-scheme: light) {
			content: url(${lightImage});
		}

		/* These class-based themes are only for Storybook/Chromatic modes
     * (see preview.js). */
		html.dark-theme & {
			content: url(${darkImage});
		}
		html.light-theme & {
			content: url(${lightImage});
		}
	`;
};

export const MinimalLayoutImage = ({ id, useDarkImage }: Props) => {
	// WCAG H67: Use null alt text for decorative images
	// ARIA: role="presentation" removes element from accessibility tree
	return <img alt="" css={imageStyles(id, useDarkImage)} role="presentation" />;
};
