import React, {
	PropsWithChildren,
	ReactNode,
	useEffect,
	useState,
} from 'react';
import { Link, TextInput } from '@guardian/source-react-components';
import { MainLayout } from '@/client/layouts/Main';
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
import { space } from '@guardian/source-foundations';
import { FieldError } from '@/shared/model/ClientState';
import { logger } from '@/client/lib/clientSideLogger';

type Props = {
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
	hasStateHandle?: boolean;
	passcodeAction?: string;
	fieldErrors?: FieldError[];
	passcode?: string;
	timeUntilTokenExpiry?: number;
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
	hasStateHandle,
	passcodeAction,
	fieldErrors,
	passcode,
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
				window.location.replace(buildUrl('/register/code/expired'));
			}, timeUntilTokenExpiry);
		}
	}, [timeUntilTokenExpiry]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const codeInput: HTMLInputElement | null =
				window.document.querySelector('input[name="code"]');

			if (codeInput) {
				codeInput.focus();
			}
		}
	}, []);

	const pageHeader = hasStateHandle
		? 'Enter your code'
		: 'Check your email inbox';

	return (
		<MainLayout
			pageHeader={pageHeader}
			successOverride={showSuccess ? 'Email sent' : undefined}
			errorOverride={
				recaptchaErrorMessage ? recaptchaErrorMessage : errorMessage
			}
			errorContext={recaptchaErrorContext}
		>
			{children}
			{!hasStateHandle && (
				<>
					{email ? (
						<MainBodyText>
							We’ve sent an email to <b>{email}</b>
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
				</>
			)}
			{hasStateHandle && (
				<>
					{email ? (
						<MainBodyText>
							We’ve sent an email to <b>{email}</b> with verification
							instructions and a verification code.
						</MainBodyText>
					) : (
						<MainBodyText>
							We’ve sent you an email with verification instructions and a
							verification code.
						</MainBodyText>
					)}
				</>
			)}
			<MainBodyText>
				<b>
					For your security, the link in the email will expire in{' '}
					{hasStateHandle && passcodeAction ? '30' : '60'} minutes.
				</b>
			</MainBodyText>
			{hasStateHandle && passcodeAction && (
				<div
					css={css`
						margin-bottom: ${space[3]}px;
					`}
				>
					<MainForm
						formAction={`${passcodeAction}${queryString}`}
						submitButtonText="Submit passcode"
						disableOnSubmit
					>
						<TextInput
							label="Verification code"
							type="text"
							width={4}
							pattern="\d{6}"
							name="code"
							autoComplete="one-time-code"
							inputMode="numeric"
							maxLength={6}
							error={
								fieldErrors?.find((error) => error.field === 'code')?.message
							}
							defaultValue={passcode}
						/>
					</MainForm>
				</div>
			)}
			<InformationBox>
				<InformationBoxText>
					Didn’t get the email? Check your spam
					{email && resendEmailAction && (
						<>
							,{!changeEmailPage ? <> or </> : <> </>}
							<MainForm
								formAction={
									hasStateHandle
										? `${passcodeAction}/resend${queryString}`
										: `${resendEmailAction}${queryString}`
								}
								submitButtonText={'send again'}
								recaptchaSiteKey={recaptchaSiteKey}
								setRecaptchaErrorContext={setRecaptchaErrorContext}
								setRecaptchaErrorMessage={setRecaptchaErrorMessage}
								formTrackingName={formTrackingName}
								disableOnSubmit
								formErrorMessageFromParent={formError}
								submitButtonLink
								hideRecaptchaMessage
							>
								<EmailInput defaultValue={email} hidden hideLabel />
							</MainForm>
						</>
					)}
					{changeEmailPage && <>, or</>}
					{changeEmailPage && (
						<>
							{' '}
							<Link href={`${changeEmailPage}${queryString}`}>
								try another address
							</Link>
						</>
					)}
					.
				</InformationBoxText>
				{noAccountInfo && (
					<InformationBoxText>
						If you don’t receive an email within 2 minutes you may not have an
						account. Don’t have an account?{' '}
						<Link href={`${buildUrl('/register')}${queryString}`}>
							Register for free
						</Link>
						.
					</InformationBoxText>
				)}
				<InformationBoxText>
					For further assistance, email our customer service team at{' '}
					<ExternalLink href={locations.SUPPORT_EMAIL_MAILTO}>
						{SUPPORT_EMAIL}
					</ExternalLink>
				</InformationBoxText>
			</InformationBox>
		</MainLayout>
	);
};
