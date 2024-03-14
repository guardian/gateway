import React from 'react';
import {
	LinkProps,
	Link as SourceLink,
} from '@guardian/source-react-components';
import { css } from '@emotion/react';

const linkThemeStyles = css`
	color: var(--color-link);
	&:hover {
		color: var(--color-link);
	}
`;

export default function Link(props: LinkProps) {
	return <SourceLink {...props} css={linkThemeStyles} />;
}
