import React, { PropsWithChildren, ReactNode, useState } from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { EmailSentInformationBox } from '@/client/components/EmailSentInformationBox';

import { GatewayError } from '@/shared/model/Errors';

export type EmailSentProps = {
	email?: string;
	changeEmailPage?: string;
	resendEmailAction?: string;
	queryString?: string;
	showSuccess?: boolean;
	errorMessage?: string;
	noAccountInfo?: boolean;
	recaptchaSiteKey?: string;
	formTrackingName?: string;
	formError?: GatewayError;
	instructionContext?: string;
	shortRequestId?: string;
	showSignInWithPasswordOption?: boolean;
};

export const EmailSent = ({
	email,
	changeEmailPage,
	resendEmailAction,
	queryString,
	showSuccess,
	errorMessage,
	noAccountInfo,
	recaptchaSiteKey,
	formTrackingName,
	children,
	formError,
	instructionContext,
	shortRequestId,
	showSignInWithPasswordOption = false,
}: PropsWithChildren<EmailSentProps>) => {
	const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
	const [recaptchaErrorContext, setRecaptchaErrorContext] =
		useState<ReactNode>(null);

	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			pageHeader="Check your inbox"
			successOverride={showSuccess ? 'Email sent' : undefined}
			errorOverride={
				recaptchaErrorMessage ? recaptchaErrorMessage : errorMessage
			}
			errorContext={recaptchaErrorContext}
			imageId="email"
		>
			{children}

			{email ? (
				<MainBodyText>
					We’ve sent an email to <strong>{email}</strong>
				</MainBodyText>
			) : (
				<MainBodyText>We’ve sent you an email.</MainBodyText>
			)}
			{instructionContext ? (
				<MainBodyText>
					Please follow the link in the email to {instructionContext}.
				</MainBodyText>
			) : (
				<MainBodyText>
					Please follow the instructions in this email.
				</MainBodyText>
			)}

			<MainBodyText>
				For your security, the link in the email will expire in 60 minutes.
			</MainBodyText>
			<EmailSentInformationBox
				setRecaptchaErrorContext={setRecaptchaErrorContext}
				setRecaptchaErrorMessage={setRecaptchaErrorMessage}
				email={email}
				resendEmailAction={resendEmailAction}
				noAccountInfo={noAccountInfo}
				changeEmailPage={changeEmailPage}
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formTrackingName}
				formError={formError}
				queryString={queryString}
				shortRequestId={shortRequestId}
				showSignInWithPasswordOption={showSignInWithPasswordOption}
			/>
		</MinimalLayout>
	);
};
