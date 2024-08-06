import { css } from '@emotion/react';
import { from, palette, remSpace } from '@guardian/source/foundations';
import { SvgGuardianLogo } from '@guardian/source/react-components';
import React from 'react';

const headerStyles = css`
	border-bottom: 1px solid ${palette.neutral[46]};
	padding: ${remSpace[4]} ${remSpace[4]} ${remSpace[2]} ${remSpace[5]};
	display: flex;
	justify-content: flex-end;
`;

const logoStyles = css`
	height: 2rem;
	display: flex;
	svg {
		fill: var(--color-logo);
		height: 100%;
	}
	${from.desktop} {
		height: 5.5rem;
	}
`;

export default function MinimalHeader() {
	return (
		<header css={headerStyles}>
			<div css={logoStyles}>
				<SvgGuardianLogo />
			</div>
		</header>
	);
}
