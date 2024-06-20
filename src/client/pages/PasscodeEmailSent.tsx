import React, { ReactNode, useState, useEffect } from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import { buildUrl } from '@/shared/lib/routeUtils';
import { FieldError } from '@/shared/model/ClientState';
import { logger } from '@/client/lib/clientSideLogger';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { PasscodeInput } from '@/client/components/PasscodeInput';
import { EmailSentInformationBox } from '@/client/components/EmailSentInformationBox';
import { EmailSentProps } from '@/client/pages/EmailSent';

type Props = {
	passcodeAction: string;
	fieldErrors?: FieldError[];
	passcode?: string;
	recaptchaSiteKey?: string;
	timeUntilTokenExpiry?: number;
};

type PasscodeEmailSentProps = EmailSentProps & Props;

export const PasscodeEmailSent = ({
	changeEmailPage,
	email,
	errorMessage,
	fieldErrors,
	formError,
	formTrackingName,
	passcode,
	passcodeAction,
	queryString,
	recaptchaSiteKey,
	showSuccess,
	timeUntilTokenExpiry,
}: PasscodeEmailSentProps) => {
	const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
	const [recaptchaErrorContext, setRecaptchaErrorContext] =
		useState<ReactNode>(null);

	useEffect(() => {
		// we only want this to run in the browser as window is not
		// defined on the server
		// and we also check that the expiry time exists so that
		// we redirect to the session expired page
		// if the token expires while the user is on the current page
		if (typeof window !== 'undefined' && timeUntilTokenExpiry) {
			logger.info(`Welcome page: loaded successfully`, undefined, {
				timeUntilTokenExpiry,
			});
			setTimeout(() => {
				logger.info(
					`Welcome page: redirecting to token expired page`,
					undefined,
					{ timeUntilTokenExpiry },
				);
				window.location.replace(buildUrl('/welcome/expired'));
			}, timeUntilTokenExpiry);
		}
	}, [timeUntilTokenExpiry]);

	// autofocus the code input field when the page loads
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const codeInput: HTMLInputElement | null =
				window.document.querySelector('input[name="code"]');

			if (codeInput) {
				codeInput.focus();
			}
		}
	}, []);

	return (
		<MinimalLayout
			pageHeader="Enter your code"
			successOverride={
				showSuccess ? 'Email with verification code sent' : undefined
			}
			errorOverride={
				recaptchaErrorMessage ? recaptchaErrorMessage : errorMessage
			}
			errorContext={recaptchaErrorContext}
			imageId="email"
		>
			{email ? (
				<MainBodyText>
					We’ve sent a temporary verification code to <strong>{email}</strong>.
					Please check your inbox.
				</MainBodyText>
			) : (
				<MainBodyText>
					We’ve sent you a temporary verification code. Please check your inbox.
				</MainBodyText>
			)}
			<MainBodyText>
				For your security, the verification code will expire in 30 minutes.
			</MainBodyText>
			<MainForm
				formAction={`${passcodeAction}${queryString}`}
				submitButtonText="Submit verification code"
				disableOnSubmit
			>
				<PasscodeInput passcode={passcode} fieldErrors={fieldErrors} />
			</MainForm>
			<EmailSentInformationBox
				setRecaptchaErrorContext={setRecaptchaErrorContext}
				setRecaptchaErrorMessage={setRecaptchaErrorMessage}
				email={email}
				resendEmailAction={`${passcodeAction}/resend`}
				changeEmailPage={changeEmailPage}
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formTrackingName}
				formError={formError}
				queryString={queryString}
			/>
		</MinimalLayout>
	);
};
