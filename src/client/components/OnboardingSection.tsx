import { css } from '@emotion/react';
import { palette, remSpace } from '@guardian/source/foundations';
import { MainBodyText } from '@/client/components/MainBodyText';
import { headlineBold24 } from '@guardian/source/foundations';
import React from 'react';

interface OnboardingSectionProps {
	header?: string;
	subHeader?: string;
	children?: React.ReactNode;
}

export const OnboardingSection = ({
	children,
	header,
	subHeader,
}: OnboardingSectionProps) => {
	const sectionMainStyles = css`
		background-color: ${palette.neutral[100]};
		border-radius: ${remSpace[2]};
		padding: ${remSpace[2]} ${remSpace[3]} ${remSpace[6]} ${remSpace[3]};
		display: flex;
		flex-direction: column;
		gap: ${remSpace[4]};
	`;

	return (
		<div css={sectionMainStyles}>
			<MainBodyText
				cssOverrides={css`
					${headlineBold24};
					font-weight: 500;
					padding-bottom: ${remSpace[2]};
				`}
			>
				{header}
			</MainBodyText>
			<MainBodyText
				cssOverrides={css`
					padding-bottom: ${remSpace[6]};
				`}
			>
				{subHeader}
			</MainBodyText>
			{children}
		</div>
	);
};
