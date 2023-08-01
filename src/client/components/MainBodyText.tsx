import React, { PropsWithChildren } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { space, text, textSans } from '@guardian/source-foundations';
interface Props {
	noMargin?: boolean;
	marginTop?: boolean;
	cssOverrides?: SerializedStyles;
}

const mainBodyTextStyles = (noMargin = false, marginTop = false) => css`
	${textSans.medium({ lineHeight: 'regular' })}
	font-size: 17px;
	color: ${text.primary};
	${marginTop
		? ''
		: css`
				margin-top: 0;
		  `}

	${noMargin
		? css`
				margin-bottom: 0;
		  `
		: css`
				margin-bottom: ${space[3]}px;
		  `}
`;

export const MainBodyText = ({
	children,
	cssOverrides,
	noMargin,
	marginTop,
}: PropsWithChildren<Props>) => (
	<p css={[mainBodyTextStyles(noMargin, marginTop), cssOverrides]}>
		{children}
	</p>
);
