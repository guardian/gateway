import React, { FunctionComponent, PropsWithChildren } from 'react';
import { css } from '@emotion/react';
import { Footer } from '@/client/components/Footer';
import useClientState from '@/client/lib/hooks/useClientState';
import {
	getAutoRow,
	gridItemColumnConsents,
	gridRow,
} from '@/client/styles/Grid';
import { greyBorderSides } from '@/client/styles/Consents';
import { ConsentsSubHeader } from '@/client/components/ConsentsSubHeader';
import { ConsentsHeader } from '@/client/components/ConsentsHeader';
import { abSimplifyRegistrationFlowTest } from '@/shared/model/experiments/tests/abSimplifyRegistrationFlowTest';

interface ConsentsLayoutProps {
	current?: string;
	title: string;
	showContinueButton?: boolean;
	errorMessage?: string;
	errorContext?: React.ReactNode;
}

const mainStyles = css`
	display: flex;
	flex-direction: column;
	flex: 1 0 auto;
`;

// Ensures grey borders reach to bottom of page
const spacer = css`
	flex-grow: 1;
`;

export const ConsentsLayout: FunctionComponent<
	PropsWithChildren<ConsentsLayoutProps>
> = ({ children, current, title, errorMessage, errorContext }) => {
	const autoRow = getAutoRow(1, gridItemColumnConsents);
	const clientState = useClientState();
	const {
		globalMessage: { error: globalError, success: globalSuccess } = {},
		pageData: { isNativeApp } = {},
		//@AB_TEST: 3 Stage Registration Flow Test
		abTesting: { participations = {} } = {},
	} = clientState;
	//@AB_TEST: 3 Stage Registration Flow Test
	const isInAbSimplifyRegFlowTest =
		participations[abSimplifyRegistrationFlowTest.id]?.variant ===
		abSimplifyRegistrationFlowTest.variants[0].id;
	return (
		<>
			<ConsentsHeader
				error={globalError}
				success={globalSuccess}
				isNativeApp={isNativeApp}
			/>
			<main css={mainStyles}>
				<ConsentsSubHeader
					autoRow={autoRow}
					title={title}
					current={current}
					errorMessage={errorMessage}
					errorContext={errorContext}
					isNativeApp={isNativeApp}
					//@AB_TEST: 3 Stage Registration Flow Test
					isInAbSimplifyRegFlowTest={isInAbSimplifyRegFlowTest}
				/>
				{children && (
					<section css={[gridRow, greyBorderSides]}>{children}</section>
				)}
				<div css={[spacer, gridRow, greyBorderSides]} />
			</main>
			{!isNativeApp && <Footer />}
		</>
	);
};
