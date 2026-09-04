import { MainBodyText } from '@/client/components/MainBodyText';
import { headlineBold20, remSpace } from '@guardian/source/foundations';
import { css } from '@emotion/react';

interface OnboardingCardProps {
	title: string;
	text: string;
	backgroundColour?: string;
}

const styles = (backgroundColour: string | undefined) => css`
	background-color: ${backgroundColour ? backgroundColour : '#FFFFFF'};
	border-radius: ${remSpace[2]};
	padding: ${remSpace[2]} ${remSpace[2]} ${remSpace[2]} ${remSpace[2]};
	display: grid;
	grid-template-columns: 70% 30%;
	grid-template-areas:
		'title image'
		'text  image'
		'cta   image';
`;

export const OnboardingCard = ({
	title,
	text,
	backgroundColour,
}: OnboardingCardProps) => {
	return (
		<div css={styles(backgroundColour)}>
			<MainBodyText
				cssOverrides={css`
					${headlineBold20};
					font-weight: 500;
					padding-bottom: ${remSpace[2]};
					grid-area: title;
				`}
			>
				{title}
			</MainBodyText>
			<MainBodyText
				cssOverrides={css`
					grid-area: text;
				`}
			>
				{text}
			</MainBodyText>

			<div
				css={css`
					grid-area: cta;
				`}
			>
				Button
			</div>
			<div
				css={css`
					grid-area: image;
				`}
			>
				Image
			</div>
		</div>
	);
};
