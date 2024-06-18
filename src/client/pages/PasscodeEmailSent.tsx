import React, {
	PropsWithChildren,
	ReactNode,
	useState,
	useEffect,
} from 'react';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { ExternalLink } from '@/client/components/ExternalLink';
import { buildUrl } from '@/shared/lib/routeUtils';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';
import {
	InformationBox,
	InformationBoxText,
} from '@/client/components/InformationBox';
import { css } from '@emotion/react';
import { FieldError } from '@/shared/model/ClientState';
import { logger } from '@/client/lib/clientSideLogger';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import ThemedLink from '@/client/components/ThemedLink';
import { PasscodeInput } from '@/client/components/PasscodeInput';

type Props = {
	passcodeAction: string;
	changeEmailPage?: string;
	email?: string;
	errorMessage?: string;
	fieldErrors?: FieldError[];
	formError?: string;
	formTrackingName?: string;
	passcode?: string;
	queryString?: string;
	recaptchaSiteKey?: string;
	showSuccess?: boolean;
	timeUntilTokenExpiry?: number;
};

const sendAgainFormWrapperStyles = css`
	white-space: nowrap;
`;

export const PasscodeEmailSent = ({
	changeEmailPage,
	children,
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
}: PropsWithChildren<Props>) => {
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
			<InformationBox>
				<InformationBoxText>
					Didn’t get the email? Check your spam&#8288;
					{email && (
						<span css={sendAgainFormWrapperStyles}>
							,{!changeEmailPage ? <> or </> : <> </>}
							<MainForm
								formAction={`${passcodeAction}/resend${queryString}`}
								submitButtonText={'send again'}
								recaptchaSiteKey={recaptchaSiteKey}
								setRecaptchaErrorContext={setRecaptchaErrorContext}
								setRecaptchaErrorMessage={setRecaptchaErrorMessage}
								formTrackingName={formTrackingName}
								disableOnSubmit
								formErrorMessageFromParent={formError}
								displayInline
								submitButtonLink
								hideRecaptchaMessage
							>
								<EmailInput defaultValue={email} hidden hideLabel />
							</MainForm>
						</span>
					)}
					{changeEmailPage && (
						<>
							, or{' '}
							<ThemedLink href={`${changeEmailPage}${queryString}`}>
								try another address
							</ThemedLink>
						</>
					)}
					.
				</InformationBoxText>
				<InformationBoxText>
					For further assistance, email our customer service team at{' '}
					<ExternalLink href={locations.SUPPORT_EMAIL_MAILTO}>
						{SUPPORT_EMAIL}
					</ExternalLink>
				</InformationBoxText>
			</InformationBox>
		</MinimalLayout>
	);
};
