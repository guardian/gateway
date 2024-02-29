import React, { PropsWithChildren, ReactNode, useState } from 'react';
import { Link } from '@guardian/source-react-components';
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
	return (
		<MainLayout
			pageHeader="Check your email inbox"
			successOverride={showSuccess ? 'Email sent' : undefined}
			errorOverride={
				recaptchaErrorMessage ? recaptchaErrorMessage : errorMessage
			}
			errorContext={recaptchaErrorContext}
		>
			{children}
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
			<MainBodyText>
				<b>
					For your security, the link in the email will expire in 60 minutes.
				</b>
			</MainBodyText>
			<InformationBox>
				<InformationBoxText>
					Didn’t get the email? Check your spam
					{email && resendEmailAction && (
						<>
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
