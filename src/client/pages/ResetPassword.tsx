import React, { PropsWithChildren, ReactNode, useState } from 'react';

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

import { GatewayError } from '@/shared/model/Errors';

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
}

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
}: PropsWithChildren<ResetPasswordProps>) => {
	// track page/form load
	usePageLoadOphanInteraction(formPageTrackingName);

	const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
	const [recaptchaErrorContext, setRecaptchaErrorContext] =
		useState<ReactNode>(null);

	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader={headerText}
			errorContext={recaptchaErrorContext}
			errorOverride={recaptchaErrorMessage}
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
				setRecaptchaErrorMessage={setRecaptchaErrorMessage}
				setRecaptchaErrorContext={setRecaptchaErrorContext}
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
