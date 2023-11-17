import React from 'react';
import { MainLayout } from '@/client/layouts/Main';
import { MainForm } from '@/client/components/MainForm';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { RegistrationProps } from './Registration';
import { css } from '@emotion/react';
import {
	palette,
	remHeight,
	remWidth,
	space,
	textSans,
} from '@guardian/source-foundations';
import { MainBodyText } from '@/client/components/MainBodyText';
import {
	SvgAppleBrand,
	SvgGoogleBrand,
	SvgTickRound,
} from '@guardian/source-react-components';
import { RegistrationMarketingConsentFormField } from '../components/RegistrationMarketingConsentFormField';
import { SocialProvider } from '@/shared/model/Social';
import { IsNativeApp } from '@/shared/model/ClientState';

const inlineMessage = css`
	display: flex;
	align-items: flex-start;
	${textSans.large()};

	svg {
		fill: currentColor;
		flex: none;
		width: ${remWidth.iconMedium}rem;
		height: ${remHeight.iconMedium}rem;
		color: ${palette.success[400]};
		/* a visual kick to vertically align the icons with the top row of text */
		transform: translate(0px, -2px);

		&:last-of-type {
			margin-left: ${space[1]}px;
		}
	}
`;

export type WelcomeSocialProps = RegistrationProps & {
	socialProvider: SocialProvider;
	isNativeApp?: IsNativeApp;
};

export const WelcomeSocial = ({
	queryParams,
	formError,
	socialProvider,
	isNativeApp,
}: WelcomeSocialProps) => {
	const formTrackingName = 'register';

	usePageLoadOphanInteraction(formTrackingName);

	return (
		<MainLayout>
			<MainForm
				formAction={buildUrlWithQueryParams('/welcome/social', {}, queryParams)}
				submitButtonText="Confirm"
				formTrackingName={formTrackingName}
				disableOnSubmit
				formErrorMessageFromParent={formError}
				largeFormMarginTop
			>
				{socialProvider === 'google' && (
					<MainBodyText cssOverrides={inlineMessage}>
						<SvgGoogleBrand />
						Google account verified
						<SvgTickRound />
					</MainBodyText>
				)}
				{socialProvider === 'apple' && (
					<MainBodyText cssOverrides={inlineMessage}>
						<SvgAppleBrand />
						Apple account verified
						<SvgTickRound />
					</MainBodyText>
				)}

				<RegistrationMarketingConsentFormField isNativeApp={isNativeApp} />
			</MainForm>
		</MainLayout>
	);
};
