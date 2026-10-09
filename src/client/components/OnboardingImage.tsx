import { css } from '@emotion/react';
import { from } from '@guardian/source/foundations';

interface OnboardingImageProps {
	path: string;
	type: OnboardingImageType;
}

export type OnboardingImageType = 'rectangle' | 'small-circle';

const imageStyles = (type: OnboardingImageType) => css`
	width: ${type === 'small-circle' ? '64px' : '110px'};
	height: ${type === 'small-circle' ? '64px' : '132px'};

	${from.tablet} {
		float: right;
	}

	${from.tablet} {
		width: ${type === 'small-circle' ? '80px' : '123px'};
		height: ${type === 'small-circle' ? '80px' : '149px'};
	}

	${from.desktop} {
		width: ${type === 'small-circle' ? '80px' : '164px'};
		height: ${type === 'small-circle' ? '80px' : '198px'};
	}
	border-radius: ${type === 'small-circle' ? '50%' : '0%'};
`;

export const OnboardingImage = ({ path, type }: OnboardingImageProps) => {
	return <img alt="" src={path} css={imageStyles(type)} />;
};
