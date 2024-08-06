import { css } from '@emotion/react';
import { from, headline, remSpace } from '@guardian/source/foundations';
import {
	ErrorSummary,
	SuccessSummary,
} from '@guardian/source-development-kitchen/react-components';
import React from 'react';
import type { DecorativeImageId } from '@/client/assets/decorative';
import { MainBodyText } from '@/client/components/MainBodyText';
import MinimalHeader from '@/client/components/MinimalHeader';
import { MinimalLayoutImage } from '@/client/components/MinimalLayoutImage';
import useClientState from '@/client/lib/hooks/useClientState';
import {
	CONTAINER_GAP,
	LAYOUT_WIDTH_NARROW,
	LAYOUT_WIDTH_WIDE,
} from '@/client/models/Style';
import {
	errorMessageStyles,
	mainSectionStyles,
	successMessageStyles,
} from '@/client/styles/Shared';
import { Theme } from '@/client/styles/Theme';
import locations from '@/shared/lib/locations';

export interface MinimalLayoutProps {
	children?: React.ReactNode;
	wide?: boolean;
	pageHeader: string;
	leadText?: React.ReactNode;
	imageId?: DecorativeImageId;
	successOverride?: string;
	errorOverride?: string;
	errorContext?: React.ReactNode;
	showErrorReportUrl?: boolean;
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

const pageHeaderStyles = css`
	color: var(--color-heading);
	${headline.small({ fontWeight: 'bold' })};
	margin: 0;
`;

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
}: MinimalLayoutProps) => {
	const clientState = useClientState();
	const { globalMessage: { error, success } = {} } = clientState;

	const successMessage = successOverride || success;
	const errorMessage = errorOverride || error;

	return (
		<>
			<Theme />
			<MinimalHeader />
			<main css={mainStyles(wide)}>
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
						<ErrorSummary
							message={errorMessage}
							context={errorContext}
							errorReportUrl={
								showErrorReportUrl ? locations.REPORT_ISSUE : undefined
							}
							css={errorMessageStyles}
						/>
					)}
					{successMessage && !errorMessage && (
						<SuccessSummary
							message={successMessage}
							css={successMessageStyles}
						/>
					)}
					{children}
				</section>
			</main>
		</>
	);
};
