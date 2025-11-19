import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import { FieldError } from '@/shared/model/ClientState';
import { logger } from '@/client/lib/clientSideLogger';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { PasscodeInput } from '@/client/components/PasscodeInput';
import { EmailSentInformationBox } from '@/client/components/EmailSentInformationBox';
import { EmailSentProps } from '@/client/pages/EmailSent';
import useClientState from '../lib/hooks/useClientState';
import { record, trackFormSubmit } from '../lib/ophan';

type Props = {
	passcodeAction: string;
	expiredPage: string;
	fieldErrors?: FieldError[];
	passcode?: string;
	recaptchaSiteKey?: string;
	timeUntilTokenExpiry?: number;
	noAccountInfo?: boolean;
	showSignInWithPasswordOption?: boolean;
	sendAgainTimerInSeconds?: number;
};

type IframedPasscodeEmailSentProps = EmailSentProps & Props;

type Text = {
	title: string;
	sentTextWithEmail: string;
	sentTextWithoutEmail: string;
	securityText: string;
	passcodeInputLabel: string;
	submitButtonText: string;
};

const text: Text = {
	title: 'Enter your code',
	sentTextWithEmail: 'We’ve sent a temporary verification code to',
	sentTextWithoutEmail:
		'We’ve sent you a temporary verification code. Please check your inbox.',
	securityText:
		'For your security, the verification code will expire in 30 minutes.',
	passcodeInputLabel: 'Verification code',
	submitButtonText: 'Submit verification code',
};

type UserStateChangeStatus = 'userSignedIn' | 'userRegistered' | 'authError';

const deriveStatusFromResponseUrl = (
	urlString: string,
): UserStateChangeStatus => {
	const responseUrl = new URL(urlString);
	const reponseUrlPath = responseUrl.pathname;
	if (reponseUrlPath.startsWith('/welcome')) {
		if (reponseUrlPath.includes('existing')) {
			return 'userSignedIn';
		}
		return 'userRegistered';
	} else {
		return 'authError';
	}
};

export const IframedPasscodeEmailSent = ({
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
	timeUntilTokenExpiry,
	expiredPage,
	shortRequestId,
	noAccountInfo,
	sendAgainTimerInSeconds,
}: IframedPasscodeEmailSentProps) => {
	const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
	const [recaptchaErrorContext, setRecaptchaErrorContext] =
		useState<ReactNode>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const clientState = useClientState();
	const formAction = `${passcodeAction}${queryString}`;

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

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const csrfToken = clientState.csrf?.token;
			if (!csrfToken) {
				throw new Error(
					'missing CSRF token for passcode submission fetch request',
				);
			}
			const formEl = formRef.current;
			if (!formEl) {
				throw new Error('error, could not locate passcode submission form');
			}
			const formData = new FormData(formEl);

			const formDataPasscode = formData.get('code');
			if (typeof formDataPasscode !== 'string') {
				throw new Error('error, form passcode value is of unknown type');
			}

			const requestFormData = new URLSearchParams();
			requestFormData.append('_csrf', csrfToken);
			requestFormData.append('submission-method', 'fetch');
			requestFormData.append('code', formDataPasscode);

			const response = await fetch(formAction, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				method: 'POST',
				credentials: 'include',
				redirect: 'follow',
				body: requestFormData.toString(),
			});
			if (!response.ok) {
				throw new Error('response status error');
			}
			const userStatus = deriveStatusFromResponseUrl(response.url);

			window.parent.postMessage(
				{
					context: 'supporterOnboarding',
					type: 'userStateChange',
					value: userStatus,
				},
				'*',
			);

			trackFormSubmit('passcode-submit');
		} catch (e) {
			record({
				experiences: 'passcode-submit-failure',
			});
		}
	};

	return (
		<MinimalLayout
			errorContext={recaptchaErrorContext}
			errorOverride={
				recaptchaErrorMessage ? recaptchaErrorMessage : errorMessage
			}
			pageHeader={text.title}
			shortRequestId={shortRequestId}
			showGuardianHeader={false}
			subduedHeadingStyle={true}
			overrideTheme="light"
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
				formAction={formAction}
				submitButtonText={text.submitButtonText}
				onSubmit={handleFormSubmit}
				disableOnSubmit={true}
				shortRequestId={shortRequestId}
				formRef={formRef}
			>
				<PasscodeInput
					passcode={passcode}
					fieldErrors={fieldErrors}
					label={text.passcodeInputLabel}
					formRef={formRef}
					autoFocus
				/>
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
				shortRequestId={shortRequestId}
				noAccountInfo={noAccountInfo}
				sendAgainTimerInSeconds={sendAgainTimerInSeconds}
				theme="secondary"
			/>
		</MinimalLayout>
	);
};
