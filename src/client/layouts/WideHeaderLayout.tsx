import React from 'react';
import { getTheme, OverrideTheme } from '../styles/Theme';
import { css } from '@emotion/react';
import { CONTAINER_GAP, LAYOUT_WIDTH_NARROW } from '../models/Style';
import {
	from,
	headlineMedium24,
	headlineMedium28,
	remSpace,
	textEgyptian17,
} from '@guardian/source/foundations';
import { DecorativeImageId } from '../assets/decorative';
import MinimalHeader from '../components/MinimalHeader';
import { MainBodyText } from '../components/MainBodyText';
import { MinimalLayoutImage } from '../components/MinimalLayoutImage';
import { LayoutErrorBoundary } from './LayoutErrorBoundary';
import { LayoutSuccessBoundary } from './LayoutSuccessBoundary';
interface WideHeaderLayoutProps {
	children?: React.ReactNode;
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

const sharedPadding = css`
	padding: ${remSpace[3]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	${from.desktop} {
		padding: ${remSpace[16]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	}
	gap: ${CONTAINER_GAP};
`;
const containerStyles = css`
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: auto 1fr;
	grid-template-areas:
		'header'
		'text';
`;

const headerStyles = css`
	background-color: var(--color-header-background);
	width: 100%;
	grid-area: header;
`;

const pageHeaderStyles = (amIIframed: boolean) => css`
	color: var(--color-header-text);
	${
		amIIframed
			? `
            ${headlineMedium24};
            ${from.mobileLandscape} {
                ${headlineMedium28};
            }
        `
			: headlineMedium28
	};
	margin: 0;
`;

const mainStyles = css`
	${sharedPadding}
	max-width: ${LAYOUT_WIDTH_NARROW}px;
	width: 100%;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	grid-area: text;
`;

const leadTextStyles = css`
	${textEgyptian17};
	color: var(--color-header-text);
`;

const heroStyles = css`
	width: 100%;
	margin: 0 auto;
	color: var(--color-header-text);
	display: flex;
	flex-direction: column;
	padding: ${remSpace[3]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	max-width: ${LAYOUT_WIDTH_NARROW}px;
`;

export const WideHeaderLayout = ({
	pageHeader,
	leadText,
	imageId,
	children,
	successOverride,
	errorOverride,
	errorContext,
	showErrorReportUrl,
	shortRequestId,
	overrideTheme,
}: WideHeaderLayoutProps) => {
	const amIIframed = !!overrideTheme?.includes('iframe');
	return (
		<>
			{getTheme(overrideTheme)}
			<div css={containerStyles}>
				<div css={headerStyles}>
					{!amIIframed && <MinimalHeader />}
					<div css={heroStyles}>
						{imageId && (
							<MinimalLayoutImage
								id={imageId}
								isOnboardingFlow={!!overrideTheme?.includes('onboarding')}
							/>
						)}
						<h1 css={pageHeaderStyles(amIIframed)}>{pageHeader}</h1>
						{leadText && (
							<MainBodyText
								isIframed={amIIframed}
								cssOverrides={leadTextStyles}
							>
								{leadText}
							</MainBodyText>
						)}
					</div>
				</div>
				<main css={mainStyles}>
					<LayoutErrorBoundary
						errorOverride={errorOverride}
						errorContext={errorContext}
						showErrorReportUrl={showErrorReportUrl}
						shortRequestId={shortRequestId}
					/>
					<LayoutSuccessBoundary
						successOverride={successOverride}
						errorOverride={errorOverride}
					/>
					{children}
				</main>
			</div>
		</>
	);
};
