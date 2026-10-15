import React from 'react';
import { OnboardingFlowLightTheme } from '../styles/Theme';
import { css } from '@emotion/react';
import { CONTAINER_GAP, LAYOUT_WIDTH_NARROW } from '../models/Style';
import {
	from,
	breakpoints,
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
	// grid-template-columns: repeat(5, 1fr);
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

const pageHeaderStyles = css`
	color: var(--color-header-text);
	${headlineMedium28};
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
	${from.mobile} {
		max-width: ${breakpoints.mobile}px;
	}
	${from.mobileMedium} {
		max-width: ${breakpoints.mobileMedium}px;
	}

	${from.phablet} {
		max-width: ${LAYOUT_WIDTH_NARROW}px;
	}
`;

const imageWrapper = css`
	padding: 0;
	${from.mobile} {
		padding: 0 ${remSpace[16]};
	}
	${from.mobileMedium} {
		padding: 0 ${remSpace[16]};
	}
	${from.phablet} {
		padding: 0;
	}
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
}: WideHeaderLayoutProps) => {
	return (
		<>
			{/* This will be changed back to getTheme('onboarding') once we have an onboarding dark theme */}
			<OnboardingFlowLightTheme />
			<div css={containerStyles}>
				<div css={headerStyles}>
					<MinimalHeader />
					<div css={heroStyles}>
						{imageId && (
							<MinimalLayoutImage
								cssOverrides={imageWrapper}
								id={imageId}
								isOnboardingFlow
							/>
						)}
						<h1 css={pageHeaderStyles}>{pageHeader}</h1>
						{leadText && (
							<MainBodyText cssOverrides={leadTextStyles}>
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
