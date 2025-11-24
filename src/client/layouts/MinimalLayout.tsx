import React, { ReactElement, ReactNode } from 'react';
import { css } from '@emotion/react';
import MinimalHeader from '@/client/components/MinimalHeader';
import {
	from,
	headlineBold28,
	headlineMedium28,
	remSpace,
	space,
} from '@guardian/source/foundations';
import useClientState from '@/client/lib/hooks/useClientState';
import { SuccessSummary } from '@guardian/source-development-kitchen/react-components';

import locations from '@/shared/lib/locations';
import { IframeLightTheme, Theme } from '@/client/styles/Theme';
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

interface MinimalLayoutProps {
	children?: React.ReactNode;
	wide?: boolean;
	showGuardianHeader?: boolean;
	pageHeader: string;
	subduedHeadingStyle?: boolean;
	leadText?: React.ReactNode;
	imageId?: DecorativeImageId;
	successOverride?: string;
	errorOverride?: string;
	errorContext?: React.ReactNode;
	showErrorReportUrl?: boolean;
	shortRequestId?: string;
	overrideTheme?: 'iframe-light';
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
	padding: ${space[3]}px ${space[3]}px ${space[6]}px;
	display: flex;
	flex-direction: column;
	gap: ${CONTAINER_GAP};
`;

const iframeThemeWrapperStyles = css`
	display: flex;
	flex-direction: column;
	gap: ${remSpace[2]};
`;

const pageHeaderStyles = (subduedHeadingStyle: boolean) => css`
	color: var(--color-heading);
	${subduedHeadingStyle ? headlineMedium28 : headlineBold28};
	margin: 0;
`;

export const MinimalLayout = ({
	children,
	wide = false,
	showGuardianHeader = true,
	pageHeader,
	subduedHeadingStyle = false,
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
		return <Theme />;
	};

	const ConditionalIframeThemeWrapper = ({
		children,
	}: {
		children: ReactNode | ReactElement;
	}) =>
		overrideTheme?.includes('iframe') ? (
			<section css={iframeThemeWrapperStyles}>{children}</section>
		) : (
			children
		);

	return (
		<>
			{getTheme()}
			{showGuardianHeader && <MinimalHeader />}
			<main css={showGuardianHeader ? mainStyles(wide) : mainStylesStretch}>
				{imageId && <MinimalLayoutImage id={imageId} />}
				<ConditionalIframeThemeWrapper>
					{pageHeader && (
						<header>
							<h1 css={pageHeaderStyles(subduedHeadingStyle)}>{pageHeader}</h1>
						</header>
					)}
					{leadText && typeof leadText === 'string' ? (
						<MainBodyText>{leadText}</MainBodyText>
					) : (
						leadText
					)}
				</ConditionalIframeThemeWrapper>
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
		</>
	);
};
