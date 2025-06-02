import React from 'react';
import {
	EMAIL_LIGHT,
	EMAIL_DARK,
	DecorativeImageId,
} from '@/client/assets/decorative';
import { css } from '@emotion/react';

interface Props {
	id: DecorativeImageId;
}

const image = (id: DecorativeImageId) => {
	switch (id) {
		case 'email':
			return {
				light: EMAIL_LIGHT,
				dark: EMAIL_DARK,
			};
	}
};

const imageStyles = (id: DecorativeImageId) => css`
	@media (prefers-color-scheme: dark) {
		content: url(${image(id).dark});
	}
	@media (prefers-color-scheme: light) {
		content: url(${image(id).light});
	}
	/* These class-based themes are only for Storybook/Chromatic modes 
	 * (see preview.js).
	 */
	html.dark-theme & {
		content: url(${image(id).dark});
	}
	html.light-theme & {
		content: url(${image(id).light}});
	}
`;

export const MinimalLayoutImage = ({ id }: Props) => {
	// WCAG H67: Use null alt text for decorative images
	// ARIA: role="presentation" removes element from accessibility tree
	return <img alt="" css={imageStyles(id)} role="presentation" />;
};
