import { MainBodyText } from '@/client/components/MainBodyText';
import {
	headlineBold20,
	remSpace,
	from,
	textSans17,
} from '@guardian/source/foundations';
import { css } from '@emotion/react';
import { OnboardingImage } from '@/client/components/OnboardingImage';
import { Button, Hide, SvgDownload } from '@guardian/source/react-components';

interface OnboardingCardProps {
	title: string;
	text: string;
	backgroundColour?: string;
}

const styles = (backgroundColour: string | undefined) => css`
	background-color: ${backgroundColour ? backgroundColour : '#FFFFFF'};
	border-radius: ${remSpace[2]};
	display: grid;
	grid-template-columns: 2fr 1fr;
	grid-template-areas:
		'title image'
		'text  image'
		'cta   image';
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
					padding: ${remSpace[2]} 0 ${remSpace[2]} ${remSpace[2]};

					${from.tablet} {
						padding-bottom: 0;
					}
				`}
			>
				{title}
			</MainBodyText>
			<MainBodyText
				cssOverrides={css`
					grid-area: text;
					padding: 0 ${remSpace[2]} ${remSpace[3]} ${remSpace[2]};

					${from.tablet} {
						padding-bottom: ${remSpace[2]};
						${textSans17};
					}
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
				<>
					<Hide from="tablet">
						<Button
							priority="primary"
							size="xsmall"
							type="button"
							isLoading={false}
							icon={SvgDownload({
								size: 'xsmall',
							})}
						>
							Download
						</Button>
					</Hide>
					<Hide until="tablet">
						<Button
							priority="primary"
							size="small"
							type="button"
							isLoading={false}
							icon={SvgDownload({
								size: 'small',
							})}
						>
							Download
						</Button>
					</Hide>
				</>
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
