import React, { ReactElement, ReactNode } from 'react';
import { css, SerializedStyles } from '@emotion/react';
import MinimalHeader from '@/client/components/MinimalHeader';
import {
	from,
	headlineBold28,
	headlineMedium24,
	headlineMedium28,
	remSpace,
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
	pageHeader?: string;
	leadText?: React.ReactNode;
	imageId?: DecorativeImageId;
	successOverride?: string;
	errorOverride?: string;
	errorContext?: React.ReactNode;
	showErrorReportUrl?: boolean;
	shortRequestId?: string;
	overrideTheme?: 'iframe-light';
	cssOverrides?: SerializedStyles;
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
	max-width: ${LAYOUT_WIDTH_WIDE}px;
`;

const headerStyles = css`
	margin-bottom: ${remSpace[4]};
	background-color: red;
	max-width: ${LAYOUT_WIDTH_WIDE}px;
	width: 100%;
`;
const pageHeaderStyles = (amIIframed: boolean) => css`
	color: var(--color-heading);
	color: #707070;
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
	cssOverrides,
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

	const amIIframed = !!overrideTheme?.includes('iframe');

	return (
		<>
			{getTheme()}
			{!amIIframed && <MinimalHeader />}

			<section css={headerStyles}>
				<div css={[amIIframed ? mainStylesStretch : mainStyles(wide)]}>
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
				</div>
			</section>
			<main
				css={[amIIframed ? mainStylesStretch : mainStyles(wide), cssOverrides]}
			>
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
