import React from 'react';
import { css } from '@emotion/react';
import { MinimalHeader } from '../components/MinimalHeader';
import { headline, remSpace, textSans } from '@guardian/source-foundations';
import useClientState from '../lib/hooks/useClientState';
import {
	ErrorSummary,
	SuccessSummary,
} from '@guardian/source-react-components-development-kitchen';
import locations from '@/shared/lib/locations';
import { Theme } from '../styles/Theme';
import { mainSectionStyles } from '../styles/Shared';

export interface MinimalLayoutProps {
	children: React.ReactNode;
	pageHeader: string;
	pageSubText?: string;
	successOverride?: string;
	errorOverride?: string;
	errorContext?: React.ReactNode;
	showErrorReportUrl?: boolean;
}

const mainStyles = css`
	padding: ${remSpace[3]} ${remSpace[4]} ${remSpace[4]} ${remSpace[4]};
	max-width: 392px;
	width: 100%;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	gap: ${remSpace[5]};
`;

const pageHeaderStyles = css`
	color: var(--color-heading);
	${headline.small({ fontWeight: 'bold' })};
	margin: 0;
`;

const pageSubTextStyles = css`
	${textSans.small()};
	margin: 0;
	color: var(--color-text);
`;

export const MinimalLayout = ({
	children,
	pageHeader,
	pageSubText,
	successOverride,
	errorOverride,
	errorContext,
	showErrorReportUrl = false,
}: MinimalLayoutProps) => {
	const clientState = useClientState();
	const {
		globalMessage: { error, success } = {},
		// pageData: { isNativeApp } = {},
	} = clientState;

	const successMessage = successOverride || success;
	const errorMessage = errorOverride || error;

	// const hasSummary = !!(errorMessage || successMessage);
	// const hasTitleOrSummary = !!(pageHeader || hasSummary);

	return (
		<>
			<Theme />
			<MinimalHeader />
			<main css={mainStyles}>
				<header>
					<h1 css={pageHeaderStyles}>{pageHeader}</h1>
				</header>
				<section css={mainSectionStyles}>
					{pageSubText && <p css={pageSubTextStyles}>{pageSubText}</p>}
					{errorMessage && (
						<ErrorSummary
							// cssOverrides={summaryStyles(errorSmallMarginBottom)}
							message={errorMessage}
							context={errorContext}
							errorReportUrl={
								showErrorReportUrl ? locations.REPORT_ISSUE : undefined
							}
						/>
					)}
					{successMessage && !errorMessage && (
						<SuccessSummary
							// cssOverrides={summaryStyles(errorSmallMarginBottom)}
							message={successMessage}
						/>
					)}
					{children}
				</section>
			</main>
		</>
	);
};
