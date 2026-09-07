import {
	DecorativeImageId,
	FEAST_APP,
	GUARDIAN_APP,
} from '@/client/assets/decorative';
import { css } from '@emotion/react';

interface OnboardingImageProps {
	id: DecorativeImageId;
}

const imageStyles = () => css`
	width: 106px;
	height: 128px;
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
