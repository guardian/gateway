import React, { PropsWithChildren } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import {
	textSans15,
	textSans17,
	textSansBold15,
	textSansBold17,
} from '@guardian/source/foundations';

interface Props {
	cssOverrides?: SerializedStyles;
	isIframed?: boolean;
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

export const iframeMainBodyTextStyles = css`
	${textSans17};
	color: var(--color-text);
	margin: 0;

	strong {
		${textSansBold17};
		color: var(--color-strong-text);
	}

	a {
		${textSansBold17};
		color: var(--color-link);

		strong {
			color: var(--color-link);
		}
	}
`;

export const MainBodyText = ({
	children,
	cssOverrides,
	isIframed = false,
}: PropsWithChildren<Props>) => (
	<p
		css={[
			isIframed ? iframeMainBodyTextStyles : mainBodyTextStyles,
			cssOverrides,
		]}
	>
		{children}
	</p>
);
