import React, { PropsWithChildren } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { space, text, textSans } from '@guardian/source-foundations';
interface Props {
	noMarginBottom?: boolean;
	marginTop?: boolean;
	cssOverrides?: SerializedStyles;
	smallText?: boolean;
}

const mainBodyTextStyles = (
	noMarginBottom = false,
	marginTop = false,
	smallText = false,
) => css`
	${smallText
		? textSans.small({ lineHeight: 'regular' })
		: textSans.medium({ lineHeight: 'regular' })}

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
			
	& a {
		${smallText
			? textSans.small({ lineHeight: 'regular' })
			: textSans.medium({ lineHeight: 'regular' })}
	}
`;

export const MainBodyText = ({
	children,
	cssOverrides,
	noMarginBottom,
	marginTop,
	smallText,
}: PropsWithChildren<Props>) => (
	<p
		css={[
			mainBodyTextStyles(noMarginBottom, marginTop, smallText),
			cssOverrides,
		]}
	>
		{children}
	</p>
);
