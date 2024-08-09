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
}

const imageStyles = (id: DecorativeImageId) => css`
	@media (prefers-color-scheme: dark) {
		content: url(${id === 'email' ? EMAIL_DARK : WELCOME_DARK});
	}
	@media (prefers-color-scheme: light) {
		content: url(${id === 'email' ? EMAIL_LIGHT : WELCOME_LIGHT});
	}
	/* These class-based themes are only for Storybook/Chromatic modes 
	 * (see preview.js).
	 */
	html.dark-theme & {
		content: url(${id === 'email' ? EMAIL_DARK : WELCOME_DARK});
	}
	html.light-theme & {
		content: url(${id === 'email' ? EMAIL_LIGHT : WELCOME_LIGHT});
	}
`;

export const MinimalLayoutImage = ({ id }: Props) => {
	// WCAG H67: Use null alt text for decorative images
	// ARIA: role="presentation" removes element from accessibility tree
	return <img alt="" css={imageStyles(id)} role="presentation" />;
};
