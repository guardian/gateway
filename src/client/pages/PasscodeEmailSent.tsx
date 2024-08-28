import React, { ReactNode, useState, useEffect } from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import { FieldError } from '@/shared/model/ClientState';
import { logger } from '@/client/lib/clientSideLogger';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { PasscodeInput } from '@/client/components/PasscodeInput';
import { EmailSentInformationBox } from '@/client/components/EmailSentInformationBox';
import { EmailSentProps } from '@/client/pages/EmailSent';

type Props = {
	passcodeAction: string;
	expiredPage: string;
	fieldErrors?: FieldError[];
	passcode?: string;
	recaptchaSiteKey?: string;
	timeUntilTokenExpiry?: number;
};

type PasscodeEmailSentProps = EmailSentProps & Props;

type Text = {
	title: string;
	successOverride: string;
	sentTextWithEmail: string;
	sentTextWithoutEmail: string;
	securityText: string;
	submitButtonText: string;
};

const getText = (isRegistration = false): Text => {
	if (isRegistration) {
		return {
			title: 'Enter your code',
			successOverride: 'Email with verification code sent',
			sentTextWithEmail: 'We’ve sent a temporary verification code to',
			sentTextWithoutEmail:
				'We’ve sent you a temporary verification code. Please check your inbox.',
			securityText:
				'For your security, the verification code will expire in 30 minutes.',
			submitButtonText: 'Submit verification code',
		};
	}

	return {
		title: 'Enter your one-time code',
		successOverride: 'Email with one time code sent',
		sentTextWithEmail: 'We’ve sent a 6-digit code to',
		sentTextWithoutEmail:
			'We’ve sent you a 6-digit code. Please check your inbox.',
		securityText: 'For your security, the code will expire in 30 minutes.',
		submitButtonText: 'Submit one-time code',
	};
};

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
	expiredPage,
}: PasscodeEmailSentProps) => {
	const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
	const [recaptchaErrorContext, setRecaptchaErrorContext] =
		useState<ReactNode>(null);

	const text = getText(passcodeAction.includes('/register'));

	useEffect(() => {
		// we only want this to run in the browser as window is not
		// defined on the server
		// and we also check that the expiry time exists so that
		// we redirect to the session expired page
		// if the token expires while the user is on the current page
		if (typeof window !== 'undefined' && timeUntilTokenExpiry) {
			logger.info(`Passcode email sent page: loaded successfully`, undefined, {
				timeUntilTokenExpiry,
			});
			setTimeout(() => {
				logger.info(
					`Passcode email page: redirecting to token expired page`,
					undefined,
					{ timeUntilTokenExpiry },
				);
				window.location.replace(`${expiredPage}${queryString}`);
			}, timeUntilTokenExpiry);
		}
	}, [timeUntilTokenExpiry, expiredPage, queryString]);

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
			pageHeader={text.title}
			successOverride={showSuccess ? text.successOverride : undefined}
			errorOverride={
				recaptchaErrorMessage ? recaptchaErrorMessage : errorMessage
			}
			errorContext={recaptchaErrorContext}
			imageId="email"
		>
			{email ? (
				<MainBodyText>
					{text.sentTextWithEmail} <strong>{email}</strong>. Please check your
					inbox.
				</MainBodyText>
			) : (
				<MainBodyText>{text.sentTextWithoutEmail}</MainBodyText>
			)}
			<MainBodyText>{text.securityText}</MainBodyText>
			<MainForm
				formAction={`${passcodeAction}${queryString}`}
				submitButtonText={text.submitButtonText}
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
