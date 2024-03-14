import React, { PropsWithChildren, ReactNode, useState } from 'react';
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
import { MinimalLayout } from '../layouts/MinimalLayout';
import { css } from '@emotion/react';
import Link from '../components/Link';

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
	return (
		<MinimalLayout
			pageHeader="Password reset email sent"
			errorOverride={
				recaptchaErrorMessage ? recaptchaErrorMessage : errorMessage
			}
			errorContext={recaptchaErrorContext}
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
					Follow the instructions in this email to reset your password.
				</MainBodyText>
			)}
			<MainBodyText>
				<strong>For your security, this link will expire in 60 minutes.</strong>
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
							Create an account for free
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
		</MinimalLayout>
	);
};
