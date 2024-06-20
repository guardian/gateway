import React, {
	PropsWithChildren,
	ReactNode,
	useState,
	useEffect,
} from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { EmailSentInformationBox } from '@/client/components/EmailSentInformationBox';

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
	formError?: string;
	instructionContext?: string;
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
}: PropsWithChildren<EmailSentProps>) => {
	const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
	const [recaptchaErrorContext, setRecaptchaErrorContext] =
		useState<ReactNode>(null);

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
			/>
		</MinimalLayout>
	);
};
