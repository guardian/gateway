import React, { PropsWithChildren } from 'react';
import { css } from '@emotion/react';
import {
	from,
	headline,
	neutral,
	space,
	text,
} from '@guardian/source-foundations';
import {
	ErrorSummary,
	SuccessSummary,
} from '@guardian/source-react-components-development-kitchen';
import { gridRow, gridItem, SpanDefinition } from '@/client/styles/Grid';
import { Header } from '@/client/components/Header';
import { Footer } from '@/client/components/Footer';
import useClientState from '@/client/lib/hooks/useClientState';
import { Nav, TabType } from '@/client/components/Nav';
import locations from '@/shared/lib/locations';
import { MainBodyText } from '@/client/components/MainBodyText';

interface MainLayoutProps {
	pageHeader?: string;
	pageSubText?: string;
	successOverride?: string;
	errorOverride?: string;
	errorContext?: React.ReactNode;
	showErrorReportUrl?: boolean;
	useJobsHeader?: boolean;
	tabs?: TabType[];
	errorSmallMarginBottom?: boolean;
}

const mainStyles = css`
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	margin: 0 auto;
	${from.tablet} {
		border-left: 1px solid ${neutral[86]};
		border-right: 1px solid ${neutral[86]};
	}

	/* padding bottom */
	padding-bottom: 64px;
	${from.tablet} {
		padding-bottom: 96px;
	}
	${from.desktop} {
		padding-bottom: 120px;
	}
`;

const gridSpanDefinition: SpanDefinition = {
	TABLET: { start: 1, span: 8 },
	DESKTOP: { start: 2, span: 6 },
	LEFT_COL: { start: 3, span: 6 },
	WIDE: { start: 4, span: 6 },
};

const headerStyles = (hasSummary: boolean) => css`
	/* padding */
	padding-top: ${space[6]}px;
	padding-bottom: ${space[5]}px;

	${hasSummary &&
	css`
		padding-top: 0;
	`}

	${from.desktop} {
		${hasSummary
			? css`
					padding-top: 0;
				`
			: css`
					padding-top: ${space[9]}px;
				`}
	}

	/* margin */
	margin-bottom: ${space[1]}px;

	/* border */
	border-bottom: 1px solid ${neutral[86]};
`;

const pageTitleStyles = css`
	width: 100%;
	margin: 0;

	${headline.small({ fontWeight: 'bold' })}
	font-size: 28px;
	${from.desktop} {
		font-size: 32px;
	}

	color: ${text.primary};
`;

const summaryStyles = (smallMarginBottom = false) => css`
	margin-top: ${space[6]}px;
	margin-bottom: ${smallMarginBottom ? space[4] : space[6]}px;
`;

const bodyStyles = (hasTitleOrSummary: boolean) => css`
	${!hasTitleOrSummary &&
	css`
		margin-top: ${space[1]}px;
	`}
`;

export const buttonStyles = ({
	hasTerms = false,
	halfWidth = false,
	halfWidthAtMobile = false,
	hasMarginBottom = false,
}) => css`
	margin-top: ${space[4]}px;
	justify-content: center;
	width: 100%;

	/* Set the cursor when disabled temporarily so we have a visual indication
   * until we have a loading spinner.
   * PR for loading spinner in Source: https://github.com/guardian/source/pull/1275
   */
	:disabled {
		cursor: not-allowed;
	}

	${from.mobile} {
		${halfWidthAtMobile
			? css`
					width: 50%;
				`
			: css`
					width: 100%;
				`}
	}

	${from.tablet} {
		${halfWidth
			? css`
					width: 50%;
				`
			: css`
					width: 100%;
				`}
	}

	${hasTerms &&
	css`
		margin-top: ${space[3]}px;
	`}

	${hasMarginBottom &&
	css`
		margin-bottom: ${space[6]}px;
	`}
`;

const subTextStyles = css`
	padding-top: ${space[4]}px;
`;

export const MainLayout = ({
	children,
	pageHeader,
	pageSubText,
	successOverride,
	errorOverride,
	errorContext,
	showErrorReportUrl = false,
	useJobsHeader = false,
	tabs,
	errorSmallMarginBottom,
}: PropsWithChildren<MainLayoutProps>) => {
	const clientState = useClientState();
	const {
		globalMessage: { error, success } = {},
		pageData: { isNativeApp } = {},
	} = clientState;

	const successMessage = successOverride || success;
	const errorMessage = errorOverride || error;

	const hasSummary = !!(errorMessage || successMessage);
	const hasTitleOrSummary = !!(pageHeader || hasSummary);

	return (
		<>
			<Header isJobs={useJobsHeader} isNativeApp={isNativeApp} />
			{tabs && <Nav tabs={tabs} />}
			<main css={[mainStyles, gridRow]}>
				<section css={gridItem(gridSpanDefinition)}>
					{errorMessage && (
						<ErrorSummary
							cssOverrides={summaryStyles(errorSmallMarginBottom)}
							message={errorMessage}
							context={errorContext}
							errorReportUrl={
								showErrorReportUrl ? locations.REPORT_ISSUE : undefined
							}
						/>
					)}
					{successMessage && !errorMessage && (
						<SuccessSummary
							cssOverrides={summaryStyles(errorSmallMarginBottom)}
							message={successMessage}
						/>
					)}
					{pageHeader && (
						<header css={headerStyles(hasSummary)}>
							<h1 css={[pageTitleStyles]}>{pageHeader}</h1>
							{pageSubText && (
								<MainBodyText cssOverrides={subTextStyles} noMarginBottom>
									{pageSubText}
								</MainBodyText>
							)}
						</header>
					)}
					<div css={bodyStyles(hasTitleOrSummary)}>{children}</div>
				</section>
			</main>
			{!isNativeApp && <Footer />}
		</>
	);
};
