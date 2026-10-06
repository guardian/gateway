import {
	FEAST_APP,
	GUARDIAN_APP,
	OnboardingImageId,
} from '@/client/assets/decorative';
import { css } from '@emotion/react';
import { from } from '@guardian/source/foundations';

interface OnboardingImageProps {
	id: OnboardingImageId;
}

const imageStyles = () => css`
	width: 110px;
	height: 132px;

	${from.tablet} {
		float: right;
	}

	${from.tablet} {
		width: 123px;
		height: 149px;
	}

	${from.desktop} {
		width: 164px;
		height: 198px;
	}
`;

export const OnboardingImage = ({ id }: OnboardingImageProps) => {
	return (
		<img
			alt=""
			src={id === 'feast-app' ? FEAST_APP : GUARDIAN_APP}
			css={imageStyles}
		/>
	);
};
