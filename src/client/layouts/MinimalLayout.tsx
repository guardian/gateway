import React, { ReactElement, ReactNode } from 'react';
import { css } from '@emotion/react';
import MinimalHeader from '@/client/components/MinimalHeader';
import {
	from,
	headlineBold28,
	headlineMedium24,
	headlineMedium28,
	remSpace,
} from '@guardian/source/foundations';

import { getTheme, OverrideTheme } from '@/client/styles/Theme';
import { mainSectionStyles } from '@/client/styles/Shared';
import { DecorativeImageId } from '@/client/assets/decorative';
import { MinimalLayoutImage } from '@/client/components/MinimalLayoutImage';
import {
	CONTAINER_GAP,
	LAYOUT_WIDTH_NARROW,
	LAYOUT_WIDTH_WIDE,
} from '@/client/models/Style';
import { MainBodyText } from '@/client/components/MainBodyText';
import { SuccessLayout } from './SuccessLayout';
import { ErrorLayout } from './ErrorLayout';

interface MinimalLayoutProps {
	children?: React.ReactNode;
	wide?: boolean;
	pageHeader?: string;
	leadText?: React.ReactNode;
	imageId?: DecorativeImageId;
	successOverride?: string;
	errorOverride?: string;
	errorContext?: React.ReactNode;
	showErrorReportUrl?: boolean;
	shortRequestId?: string;
	overrideTheme?: OverrideTheme;
}

const mainStyles = (wide: boolean) => css`
	padding: ${remSpace[3]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	max-width: ${wide ? LAYOUT_WIDTH_WIDE : LAYOUT_WIDTH_NARROW}px;
	width: 100%;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: ${CONTAINER_GAP};
	${from.desktop} {
		padding: ${remSpace[16]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	}
`;

const mainStylesStretch = css`
	display: flex;
	flex-direction: column;
	gap: ${CONTAINER_GAP};
`;

const iframeThemeWrapperStyles = css`
	display: flex;
	flex-direction: column;
	gap: ${remSpace[2]};
`;

const onboardingStyles = (wide: boolean) => css`
	${mainStyles(wide)};
	max-width: 372px;

	${from.tablet} {
		max-width: 480px;
	}

	${from.desktop} {
		max-width: 620px;
	}
`;

const pageHeaderStyles = (amIIframed: boolean) => css`
	color: var(--color-heading);
	${
		amIIframed
			? `
            ${headlineMedium24};
            ${from.mobileLandscape} {
                ${headlineMedium28};
            }
        `
			: headlineBold28
	};
	margin: 0;
`;

const ConditionalIframeThemeWrapper = ({
	children,
	overrideTheme,
}: {
	children: ReactNode | ReactElement;
	overrideTheme: MinimalLayoutProps['overrideTheme'];
}) =>
	overrideTheme?.includes('iframe') ? (
		<section css={iframeThemeWrapperStyles}>{children}</section>
	) : (
		children
	);

export const MinimalLayout = ({
	children,
	wide = false,
	pageHeader,
	leadText,
	imageId,
	successOverride,
	errorOverride,
	errorContext,
	showErrorReportUrl = false,
	shortRequestId,
	overrideTheme,
}: MinimalLayoutProps) => {
	const getStyles = (
		amIIframed: boolean,
		isOnboarding: boolean,
		wide: boolean,
	) => {
		if (amIIframed) return mainStylesStretch;
		else if (isOnboarding) return onboardingStyles(wide);

		return mainStyles(wide);
	};

	const amIIframed = !!overrideTheme?.includes('iframe');
	const isOnboarding = overrideTheme === 'onboarding-light';

	return (
		<>
			{getTheme(overrideTheme)}
			{!amIIframed && <MinimalHeader />}

			<main css={getStyles(amIIframed, isOnboarding, wide)}>
				in
				{imageId && <MinimalLayoutImage id={imageId} />}
				<ConditionalIframeThemeWrapper overrideTheme={overrideTheme}>
					{pageHeader && (
						<header>
							<h1 css={pageHeaderStyles(amIIframed)}>{pageHeader}</h1>
						</header>
					)}
					{leadText && typeof leadText === 'string' ? (
						<MainBodyText isIframed={amIIframed}>{leadText}</MainBodyText>
					) : (
						leadText
					)}
				</ConditionalIframeThemeWrapper>
				<section css={mainSectionStyles}>
					<ErrorLayout
						errorOverride={errorOverride}
						errorContext={errorContext}
						showErrorReportUrl={showErrorReportUrl}
						shortRequestId={shortRequestId}
					/>
					<SuccessLayout
						successOverride={successOverride}
						errorOverride={errorOverride}
					/>
					{children}
				</section>
			</main>
		</>
	);
};
