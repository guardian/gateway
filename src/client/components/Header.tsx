import React from 'react';
import { css, SerializedStyles } from '@emotion/react';
import { brand, from, space, neutral } from '@guardian/source-foundations';
import { Logo } from '@guardian/source-react-components-development-kitchen';
import { JobsLogo } from '@/client/components/JobsLogo';
import { gridRow, manualRow, SpanDefinition } from '@/client/styles/Grid';
import { IsNativeApp } from '@/shared/model/ClientState';

const marginStyles = css`
	margin-top: ${space[5]}px;
	margin-bottom: 21px;
	margin-left: auto;
	margin-right: auto;
	${from.mobileMedium} {
		margin-top: 14px;
	}
	${from.tablet} {
		margin-top: ${space[2]}px;
	}
	${from.desktop} {
		margin-bottom: 15px;
	}
`;

const backgroundColor = css`
	background-color: ${brand[400]};
`;

const headerGridRightToLeft = css`
	direction: rtl;
`;

const headerSpanDefinition: SpanDefinition = {
	TABLET: {
		start: 9,
		span: 4,
	},
	DESKTOP: {
		start: 9,
		span: 4,
	},
	LEFT_COL: {
		start: 11,
		span: 4,
	},
	WIDE: {
		start: 12,
		span: 4,
	},
};

const jobsHeaderStyles = css`
	background-color: ${neutral[100]};
	/* border */
	border-bottom: 1px solid ${neutral[86]};
`;

const jobsHeaderMarginOverrides = css`
	margin-top: initial;
	margin-bottom: 2px;
	margin-left: auto;
	margin-right: auto;
	${from.mobileMedium} {
		margin-top: initial;
	}
	${from.tablet} {
		margin-top: initial;
	}
	${from.desktop} {
		margin-top: initial;
		margin-bottom: initial;
	}
`;

const nativeAppMarginOverrides = css`
	margin-top: ${space[1]}px;
	margin-bottom: ${space[1]}px;
	${from.mobileMedium} {
		margin-top: ${space[1]}px;
	}
	${from.tablet} {
		margin-top: ${space[1]}px;
	}
`;

type Props = {
	cssOverrides?: SerializedStyles;
	isJobs?: boolean;
	isNativeApp?: IsNativeApp;
};

const marginStyleOverrides = (isJobs: boolean, isNativeApp: IsNativeApp) => {
	if (isJobs) {
		return jobsHeaderMarginOverrides;
	}
	if (isNativeApp) {
		return nativeAppMarginOverrides;
	}
	return undefined;
};

export const Header = ({
	cssOverrides,
	isJobs = false,
	isNativeApp,
}: Props) => {
	return (
		<header
			id="top"
			css={[
				backgroundColor,
				isJobs ? jobsHeaderStyles : undefined,
				cssOverrides,
			]}
		>
			<div
				css={[gridRow, marginStyles, marginStyleOverrides(isJobs, isNativeApp)]}
			>
				<div css={[manualRow(1, headerSpanDefinition), headerGridRightToLeft]}>
					{isJobs ? <JobsLogo /> : <Logo />}
				</div>
			</div>
		</header>
	);
};
