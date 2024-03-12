import React, { PropsWithChildren } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { palette, space, textSans } from '@guardian/source-foundations';
import { mainTextStyles } from '../styles/Shared';
interface Props {
	noMarginBottom?: boolean;
	marginTop?: boolean;
	cssOverrides?: SerializedStyles;
}

const mainBodyTextStyles = (noMarginBottom = false, marginTop = false) => css`
	${mainTextStyles};
	color: ${palette.neutral[7]};

	${marginTop
		? ''
		: css`
				margin-top: 0;
			`}

	${noMarginBottom
		? css`
				margin-bottom: 0;
			`
		: css`
				margin-bottom: ${space[3]}px;
			`}
			
	& a {
		${textSans.small({ lineHeight: 'regular', fontWeight: 'bold' })};
	}

	strong {
		${textSans.small({ lineHeight: 'regular', fontWeight: 'bold' })};
		color: ${palette.brand[400]};
	}
`;

export const MainBodyText = ({
	children,
	cssOverrides,
	noMarginBottom,
	marginTop,
}: PropsWithChildren<Props>) => (
	<p css={[mainBodyTextStyles(noMarginBottom, marginTop), cssOverrides]}>
		{children}
	</p>
);
