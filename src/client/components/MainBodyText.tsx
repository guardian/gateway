import React, { PropsWithChildren } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { textSans } from '@guardian/source/foundations';
interface Props {
	cssOverrides?: SerializedStyles;
}

const mainBodyTextStyles = css`
	${textSans.small({ lineHeight: 'regular' })};
	color: var(--color-text);
	margin: 0;

	strong {
		${textSans.small({ lineHeight: 'regular', fontWeight: 'bold' })};
		color: var(--color-strong-text);
	}

	a {
		${textSans.small({ lineHeight: 'regular', fontWeight: 'bold' })};
		color: var(--color-link);

		strong {
			color: var(--color-link);
		}
	}
`;

export const MainBodyText = ({
	children,
	cssOverrides,
}: PropsWithChildren<Props>) => (
	<p css={[mainBodyTextStyles, cssOverrides]}>{children}</p>
);
