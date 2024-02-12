import React, { PropsWithChildren, ReactNode, useState } from 'react';
import { Link, TextInput } from '@guardian/source-react-components';
import { InfoSummary } from '@guardian/source-react-components-development-kitchen';
import { MainLayout } from '@/client/layouts/Main';
import { MainBodyText } from '@/client/components/MainBodyText';
import {
	belowFormMarginTopSpacingStyle,
	MainForm,
} from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { ExternalLink } from '@/client/components/ExternalLink';
import { css } from '@emotion/react';
import { buildUrl } from '@/shared/lib/routeUtils';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';

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
	showHelp?: boolean;
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
	showHelp,
}: PropsWithChildren<Props>) => {
	const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
	const [recaptchaErrorContext, setRecaptchaErrorContext] =
		useState<ReactNode>(null);
	const showHelpBox = showHelp || (email && resendEmailAction);
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
					We’ve sent an email to <b>{email}</b>.
				</MainBodyText>
			) : (
				<MainBodyText>We’ve sent you an email.</MainBodyText>
			)}
			<MainBodyText>Please follow the instructions in this email.</MainBodyText>
			<MainBodyText>
				<b>The link is valid for 60 minutes.</b>
			</MainBodyText>
			{changeEmailPage && (
				<MainBodyText>
					Wrong email address?{' '}
					<Link href={`${changeEmailPage}${queryString}`}>
						Change email address
					</Link>
					.
				</MainBodyText>
			)}
			<MainForm
				formAction={`/register/passwordless${queryString}`}
				submitButtonText="Submit passcode"
			>
				<TextInput
					label="Enter passcode"
					type="text"
					width={4}
					pattern="\d{6}"
					name="passcode"
					autoComplete="one-time-code"
					inputMode="numeric"
					maxLength={6}
				/>
			</MainForm>
			{email && resendEmailAction && (
				<>
					<InfoSummary
						message="Didn’t receive an email?"
						context={
							<>
								If you can’t find the email in your inbox or spam folder, please
								click below and we will send you a new one.
								{noAccountInfo && (
									<>
										<br />
										<b>
											If you don’t receive an email within 2 minutes you may not
											have an account.
										</b>
										<br />
										Don’t have an account?{' '}
										<Link href={`${buildUrl('/register')}${queryString}`}>
											Register for free
										</Link>
									</>
								)}
							</>
						}
					/>
					<MainForm
						formAction={`${resendEmailAction}${queryString}`}
						submitButtonText={'Resend email'}
						submitButtonPriority="tertiary"
						submitButtonHalfWidth
						recaptchaSiteKey={recaptchaSiteKey}
						setRecaptchaErrorContext={setRecaptchaErrorContext}
						setRecaptchaErrorMessage={setRecaptchaErrorMessage}
						formTrackingName={formTrackingName}
						disableOnSubmit
						formErrorMessageFromParent={formError}
					>
						<EmailInput defaultValue={email} hidden hideLabel />
					</MainForm>
				</>
			)}
			{showHelpBox && (
				<MainBodyText cssOverrides={belowFormMarginTopSpacingStyle}>
					If you are still having trouble, contact our customer service team at{' '}
					<ExternalLink
						cssOverrides={css`
							font-weight: 700;
						`}
						href={locations.SUPPORT_EMAIL_MAILTO}
					>
						{SUPPORT_EMAIL}
					</ExternalLink>
					.
				</MainBodyText>
			)}
		</MainLayout>
	);
};
