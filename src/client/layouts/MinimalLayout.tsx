import React from 'react';
import { css } from '@emotion/react';
import MinimalHeader from '@/client/components/MinimalHeader';
import { from, headlineBold28, remSpace } from '@guardian/source/foundations';
import useClientState from '@/client/lib/hooks/useClientState';
import { SuccessSummary } from '@guardian/source-development-kitchen/react-components';

import locations from '@/shared/lib/locations';
import { Theme } from '@/client/styles/Theme';
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
	pageHeader: string;
	leadText?: React.ReactNode;
	imageId?: DecorativeImageId;
	centered?: boolean;
	successOverride?: string;
	errorOverride?: string;
	errorContext?: React.ReactNode;
	showErrorReportUrl?: boolean;
	shortRequestId?: string;
}

const mainStyles = (wide: boolean, centered?: boolean) => css`
	padding: ${remSpace[3]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	max-width: ${wide ? LAYOUT_WIDTH_WIDE : LAYOUT_WIDTH_NARROW}px;
	width: 100%;
	margin: ${!centered && '0'} auto;
	display: flex;
	flex-direction: column;
	gap: ${CONTAINER_GAP};
	${from.desktop} {
		padding: ${remSpace[16]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	}
`;

const pageHeaderStyles = css`
	color: var(--color-heading);
	${headlineBold28};
	margin: 0;
`;

export const MinimalLayout = ({
	children,
	wide = false,
	pageHeader,
	leadText,
	imageId,
	centered,
	successOverride,
	errorOverride,
	errorContext,
	showErrorReportUrl = false,
	shortRequestId,
}: MinimalLayoutProps) => {
	const clientState = useClientState();
	const { globalMessage: { error, success } = {} } = clientState;

	const successMessage = successOverride || success;
	const errorMessage = errorOverride || error;

	return (
		<>
			<Theme />
			<MinimalHeader />
			<main css={mainStyles(wide, centered)}>
				{imageId && <MinimalLayoutImage id={imageId} />}
				{pageHeader && (
					<header>
						<h1 css={pageHeaderStyles}>{pageHeader}</h1>
					</header>
				)}
				{leadText && typeof leadText === 'string' ? (
					<MainBodyText>{leadText}</MainBodyText>
				) : (
					leadText
				)}
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
