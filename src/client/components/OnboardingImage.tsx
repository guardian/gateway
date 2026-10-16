import { css } from '@emotion/react';
import { from } from '@guardian/source/foundations';

type OnboardingImageType = 'rectangle' | 'small-circle';

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

export const RoundOnboardingImage = ({ path }: { path: string }) => {
	return <img alt="" src={path} css={imageStyles('small-circle')} />;
};

export const RectangleOnboardingImage = ({ path }: { path: string }) => {
	return <img alt="" src={path} css={imageStyles('rectangle')} />;
};
