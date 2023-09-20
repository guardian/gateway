import React, { PropsWithChildren } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { space, text, textSans } from '@guardian/source-foundations';
interface Props {
	noMarginBottom?: boolean;
	marginTop?: boolean;
	cssOverrides?: SerializedStyles;
}

const mainBodyTextStyles = (noMarginBottom = false, marginTop = false) => css`
	${textSans.medium({ lineHeight: 'regular' })}
	font-size: 17px;
	color: ${text.primary};
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
