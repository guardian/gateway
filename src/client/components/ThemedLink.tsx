import { css } from '@emotion/react';
import type { LinkProps } from '@guardian/source/react-components';
import { Link as SourceLink } from '@guardian/source/react-components';
import React from 'react';

const linkThemeStyles = css`
	color: var(--color-link);
	&:hover {
		color: var(--color-link);
	}
`;

export default function ThemedLink(props: LinkProps) {
	return <SourceLink {...props} css={linkThemeStyles} />;
}
