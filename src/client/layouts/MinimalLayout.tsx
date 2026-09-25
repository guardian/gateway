import React, { ReactElement, ReactNode } from 'react';
import { css } from '@emotion/react';
import { textEgyptian17 } from '@guardian/source/foundations';
import MinimalHeader from '@/client/components/MinimalHeader';
import {
	from,
	headlineMedium24,
	headlineMedium28,
	remSpace,
} from '@guardian/source/foundations';
import useClientState from '@/client/lib/hooks/useClientState';
import { SuccessSummary } from '@guardian/source-development-kitchen/react-components';

import locations from '@/shared/lib/locations';
import {
	IframeLightTheme,
	OnboardingLightTheme,
	Theme,
} from '@/client/styles/Theme';
import {
	mainSectionStyles,
	successMessageStyles,
} from '@/client/styles/Shared';
import { DecorativeImageId } from '@/client/assets/decorative';
import { MinimalLayoutImage } from '@/client/components/MinimalLayoutImage';
import {
	CONTAINER_GAP,
	LAYOUT_WIDTH_NARROW,
	LAYOUT_WIDTH_WIDE,
} from '@/client/models/Style';
import { MainBodyText } from '@/client/components/MainBodyText';
import { GatewayErrorSummary } from '@/client/components/GatewayErrorSummary';
import { Hero } from '../components/Hero';

interface MinimalLayoutProps {
	children?: React.ReactNode;
	wide?: boolean;
	pageHeader?: string;
	leadText?: React.ReactNode;
	imageId?: DecorativeImageId;
	useDarkImage?: boolean;
	successOverride?: string;
	errorOverride?: string;
	errorContext?: React.ReactNode;
	showErrorReportUrl?: boolean;
	shortRequestId?: string;
	overrideTheme?: 'iframe-light' | 'onboarding-light';
}

const sharedPadding = css`
	padding: ${remSpace[3]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	${from.desktop} {
		padding: ${remSpace[16]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	}
	gap: ${CONTAINER_GAP};
`;
const mainStyles = (wide: boolean) => css`
	${sharedPadding}
	max-width: ${wide ? LAYOUT_WIDTH_WIDE : LAYOUT_WIDTH_NARROW}px;
	width: 100%;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	grid-area: text;
`;

const headerStyles = css`
	background-color: var(--color-header-background);
	width: 100%;
	grid-area: header;
`;

const containerStyles = css`
	${sharedPadding}
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	grid-template-rows: auto 1fr;
	grid-template-areas:
		'header header header header header'
		'.   text   text   text   .';
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

const mainBodyTextOverrides = css`
	${textEgyptian17};
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
			: headlineMedium28
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
	const clientState = useClientState();
	const { globalMessage: { error, success } = {} } = clientState;

	const successMessage = successOverride || success;
	const errorMessage = errorOverride || error;

	const getTheme = () => {
		if (overrideTheme === 'iframe-light') {
			return <IframeLightTheme />;
		}

		if (overrideTheme === 'onboarding-light') {
			return <OnboardingLightTheme />;
		}

		return <Theme />;
	};

	const amIIframed = !!overrideTheme?.includes('iframe');

	return (
		<div css={containerStyles}>
			{getTheme()}
			<div css={headerStyles}>
				{!amIIframed && <MinimalHeader />}

				<Hero>
					{imageId && (
						<MinimalLayoutImage
							id={imageId}
							useDarkImage={overrideTheme === 'onboarding-light'}
						/>
					)}

					<ConditionalIframeThemeWrapper overrideTheme={overrideTheme}>
						{pageHeader && (
							<h1 css={pageHeaderStyles(amIIframed)}>{pageHeader}</h1>
						)}
						{leadText && typeof leadText === 'string' ? (
							<MainBodyText
								isIframed={amIIframed}
								cssOverrides={mainBodyTextOverrides}
							>
								{leadText}
							</MainBodyText>
						) : (
							leadText
						)}
					</ConditionalIframeThemeWrapper>
				</Hero>
			</div>
			<main css={amIIframed ? mainStylesStretch : mainStyles(wide)}>
				<section css={mainSectionStyles}>
					{errorMessage && (
						<GatewayErrorSummary
							gatewayError={errorMessage}
							context={errorContext}
							shortRequestId={shortRequestId}
							errorReportUrl={
								showErrorReportUrl ? locations.REPORT_ISSUE : undefined
							}
						/>
					)}
					{successMessage && !errorMessage && (
						<SuccessSummary
							message={successMessage}
							cssOverrides={successMessageStyles}
						/>
					)}
					{children}
				</section>
			</main>
		</div>
	);
};
