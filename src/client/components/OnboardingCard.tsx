import { MainBodyText } from '@/client/components/MainBodyText';
import { headlineBold20, remSpace } from '@guardian/source/foundations';
import { css } from '@emotion/react';
import { OnboardingImage } from '@/client/components/OnboardingImage';

interface OnboardingCardProps {
	title: string;
	text: string;
	backgroundColour?: string;
}

const styles = (backgroundColour: string | undefined) => css`
	background-color: ${backgroundColour ? backgroundColour : '#FFFFFF'};
	border-radius: ${remSpace[2]};
	// padding: ${remSpace[2]} ${remSpace[2]} ${remSpace[2]} ${remSpace[2]};
	display: grid;
	grid-template-columns: 2fr 1fr;
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
					padding: ${remSpace[2]} 0 0 ${remSpace[2]};
				`}
			>
				{title}
			</MainBodyText>
			<MainBodyText
				cssOverrides={css`
					grid-area: text;
					padding-left: ${remSpace[2]};
				`}
			>
				{text}
			</MainBodyText>

			<div
				css={css`
					grid-area: cta;
					padding: 0 0 ${remSpace[2]} ${remSpace[2]};
				`}
			>
				Button
			</div>
			<div
				css={css`
					grid-area: image;
					padding: ${remSpace[2]} 0 ${remSpace[2]} 0;
				`}
			>
				<OnboardingImage
					id={title === 'The Guardian app' ? 'guardian-app' : 'feast-app'}
				/>
			</div>
		</div>
	);
};
