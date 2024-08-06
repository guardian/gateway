import { css } from '@emotion/react';
import React from 'react';
import type { DecorativeImageId } from '@/client/assets/decorative';
import {
	EMAIL_DARK,
	EMAIL_LIGHT,
	WELCOME_DARK,
	WELCOME_LIGHT,
} from '@/client/assets/decorative';

export interface Props {
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
