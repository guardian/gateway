import React, { PropsWithChildren } from 'react';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import locations from '@/shared/lib/locations';
import { ExternalLink } from '@/client/components/ExternalLink';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { QueryParams } from '@/shared/model/QueryParams';
import { addQueryParamsToUntypedPath } from '@/shared/lib/queryParams';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import {
	InformationBox,
	InformationBoxText,
} from '@/client/components/InformationBox';
import { MainBodyText } from '@/client/components/MainBodyText';
import { divider } from '@/client/styles/Shared';
import { Divider } from '@guardian/source-development-kitchen/react-components';
import { GatewayError, PasscodeErrors } from '@/shared/model/Errors';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';
import ThemedLink from '@/client/components/ThemedLink';

interface ResetPasswordProps {
	email?: string;
	headerText: string;
	buttonText: string;
	queryString: QueryParams;
	formActionOverride?: string;
	emailInputLabel?: string;
	showRecentEmailInformationBox?: boolean;
	showHelpCentreMessage?: boolean;
	recaptchaSiteKey?: string;
	formPageTrackingName?: string;
	formError?: GatewayError;
	shortRequestId?: string;
	pageError?: string;
}

const getErrorContext = (pageError?: string) => {
	if (pageError === PasscodeErrors.PASSCODE_EXPIRED) {
		return (
			<>
				<div>Please request a new one-time code to reset your password.</div>
				<br />
				<div>
					If you are still having trouble, please contact our customer service
					team at{' '}
					<ThemedLink href={locations.SUPPORT_EMAIL_MAILTO}>
						{SUPPORT_EMAIL}
					</ThemedLink>
					.
				</div>
			</>
		);
	}
};

export const ResetPassword = ({
	email = '',
	headerText,
	buttonText,
	queryString,
	formActionOverride,
	emailInputLabel,
	showRecentEmailInformationBox,
	showHelpCentreMessage,
	children,
	recaptchaSiteKey,
	formPageTrackingName,
	formError,
	shortRequestId,
	pageError,
}: PropsWithChildren<ResetPasswordProps>) => {
	// track page/form load
	usePageLoadOphanInteraction(formPageTrackingName);
	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader={headerText}
			errorContext={getErrorContext(pageError)}
			errorOverride={pageError}
		>
			{children}
			<MainForm
				formAction={
					formActionOverride
						? addQueryParamsToUntypedPath(formActionOverride, queryString)
						: buildUrlWithQueryParams('/reset-password', {}, queryString)
				}
				submitButtonText={buttonText}
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formPageTrackingName}
				disableOnSubmit
				formErrorMessageFromParent={formError}
				shortRequestId={shortRequestId}
			>
				<EmailInput label={emailInputLabel} defaultValue={email} />
				{showRecentEmailInformationBox && (
					<InformationBox>
						<InformationBoxText>
							Please make sure that you are opening the most recent email we
							sent.
						</InformationBoxText>
						<InformationBoxText>
							If you are having trouble, please contact our customer service
							team using our{' '}
							<ExternalLink href={locations.REPORT_ISSUE}>
								Help Centre
							</ExternalLink>
							.
						</InformationBoxText>
					</InformationBox>
				)}
			</MainForm>
			{showHelpCentreMessage && (
				<>
					<Divider spaceAbove="tight" size="full" cssOverrides={divider} />
					<MainBodyText>
						Having trouble resetting your password? Please visit our{' '}
						<ExternalLink href={locations.SIGN_IN_HELP_CENTRE}>
							Help Centre
						</ExternalLink>
						.
					</MainBodyText>
				</>
			)}
		</MinimalLayout>
	);
};
