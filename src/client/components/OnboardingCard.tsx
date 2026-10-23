import { MainBodyText } from '@/client/components/MainBodyText';
import {
	headlineBold20,
	remSpace,
	from,
	textSans17,
} from '@guardian/source/foundations';
import { css } from '@emotion/react';

interface OnboardingCardProps {
	title: string;
	description: string;
	backgroundColour?: string;
	cta: React.ReactNode;
	image: React.ReactNode;
}

const styles = (backgroundColour: string | undefined) => css`
	background-color: ${backgroundColour ? backgroundColour : '#FFFFFF'};
	border-radius: ${remSpace[2]};
	display: grid;
	grid-template-columns: 2fr 1fr;
	grid-template-areas: 'title image' 'text image' 'cta image';
	gap: ${remSpace[1]};
	max-width: 348px;

	${from.tablet} {
		max-width: 456px;
		gap: ${remSpace[2]};
	}

	${from.desktop} {
		max-width: 596px;
	}
`;

const titleStyles = css`
	${headlineBold20};
	font-weight: 500;
	padding-bottom: ${remSpace[2]};
	grid-area: title;
	padding: ${remSpace[2]} 0 ${remSpace[2]} ${remSpace[2]};

	${from.tablet} {
		padding-bottom: 0;
	}
`;

const textStyles = css`
	grid-area: text;
	padding: 0 ${remSpace[2]} ${remSpace[3]} ${remSpace[2]};

	${from.tablet} {
		padding-bottom: ${remSpace[2]};
		${textSans17};
	}
`;

const imageStyles = css`
	grid-area: image;
	padding: ${remSpace[2]} 0 ${remSpace[2]} 0;
	display: flex;
	justify-content: center;
`;

export const OnboardingCard = ({
	title,
	description,
	backgroundColour,
	cta,
	image,
}: OnboardingCardProps) => {
	return (
		<div css={styles(backgroundColour)}>
			<MainBodyText cssOverrides={titleStyles}>{title}</MainBodyText>
			<MainBodyText cssOverrides={textStyles}>{description}</MainBodyText>

			<div
				css={css`
					grid-area: cta;
					padding: 0 0 ${remSpace[2]} ${remSpace[2]};
				`}
			>
				{cta}
			</div>
			<div css={imageStyles}>{image}</div>
		</div>
	);
};
