import React, { PropsWithChildren } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { textSans15, textSansBold15 } from '@guardian/source/foundations';

interface Props {
	cssOverrides?: SerializedStyles;
}

export const mainBodyTextStyles = css`
	${textSans15};
	color: var(--color-text);
	margin: 0;

	strong {
		${textSansBold15};
		color: var(--color-strong-text);
	}

	a {
		${textSansBold15};
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
