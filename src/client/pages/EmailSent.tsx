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
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import ThemedLink from '@/client/components/ThemedLink';

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
};

const sendAgainFormWrapperStyles = css`
	white-space: nowrap;
`;

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
}: PropsWithChildren<Props>) => {
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
			<InformationBox>
				<InformationBoxText>
					Didn’t get the email? Check your spam&#8288;
					{email && resendEmailAction && (
						<span css={sendAgainFormWrapperStyles}>
							,{!changeEmailPage ? <> or </> : <> </>}
							<MainForm
								formAction={`${resendEmailAction}${queryString}`}
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
				{noAccountInfo && (
					<InformationBoxText>
						If you don’t receive an email within 2 minutes you may not have an
						account. Don’t have an account?{' '}
						<ThemedLink href={`${buildUrl('/register')}${queryString}`}>
							Create an account for free
						</ThemedLink>
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
		</MinimalLayout>
	);
};
