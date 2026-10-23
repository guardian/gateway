import { css } from '@emotion/react';
import { from } from '@guardian/source/foundations';

type OnboardingImage = {
	path: string;
	alt?: string;
};

const sharedImageStyles = css`
	${from.tablet} {
		float: right;
	}
`;

const roundImageStyles = css`
	border-radius: 50%;
	width: 64px;
	height: 64px;

	${sharedImageStyles};
	${from.tablet} {
		width: 80px;
		height: 80px;
	}

	${from.desktop} {
		width: 80px;
		height: 80px;
	}
`;

const rectangleImageStyles = css`
	width: 110px;
	height: 132px;

	${sharedImageStyles};
	${from.tablet} {
		width: 123px;
		height: 149px;
	}

	${from.desktop} {
		width: 164px;
		height: 198px;
	}
`;

export const RoundOnboardingImage = ({ path, alt }: OnboardingImage) => {
	return <img alt={alt ?? ''} src={path} css={roundImageStyles} />;
};

export const RectangleOnboardingImage = ({ path, alt }: OnboardingImage) => {
	return <img alt={alt ?? ''} src={path} css={rectangleImageStyles} />;
};
