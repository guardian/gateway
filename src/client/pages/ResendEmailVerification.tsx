import React, { ReactNode, useState } from 'react';
import { LinkButton } from '@guardian/source-react-components';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import { EmailInput } from '@/client/components/EmailInput';
import { buildUrl } from '@/shared/lib/routeUtils';
import { MinimalLayout } from '../layouts/MinimalLayout';
import { primaryButtonStyles } from '../styles/Shared';

type ResendEmailVerificationProps = {
	email?: string;
	signInPageUrl?: string;
	successText?: string;
	recaptchaSiteKey?: string;
	formError?: string;
};

const LoggedOut = ({ signInPageUrl }: { signInPageUrl?: string }) => (
	<MinimalLayout pageHeader="Link Expired">
		<MainBodyText>Your email confirmation link has expired.</MainBodyText>
		<MainBodyText>
			The link we sent you was valid for 60 minutes. Please sign in again and we
			will resend a verification email.
		</MainBodyText>
		<LinkButton css={primaryButtonStyles} href={signInPageUrl}>
			Sign in
		</LinkButton>
	</MinimalLayout>
);

const LoggedIn = ({
	email,
	successText,
	recaptchaSiteKey,
	formError,
}: {
	email: string;
	successText?: string;
	recaptchaSiteKey?: string;
	formError?: string;
}) => {
	const [recaptchaErrorMessage, setRecaptchaErrorMessage] = useState('');
	const [recaptchaErrorContext, setRecaptchaErrorContext] =
		useState<ReactNode>(null);
	return (
		<MinimalLayout
			pageHeader="Verify Email"
			errorOverride={recaptchaErrorMessage}
			errorContext={recaptchaErrorContext}
		>
			<MainBodyText>
				You need to confirm your email address to continue securely:
			</MainBodyText>
			<MainBodyText>
				<strong>{email}</strong>
			</MainBodyText>
			<MainBodyText>
				We will send you a verification link to your email to ensure that it’s
				you. Please note that the link will expire in 60 minutes.
			</MainBodyText>
			<MainBodyText>
				If you don&apos;t see it in your inbox, please check your spam filter.
			</MainBodyText>
			{successText ? (
				<MainBodyText>{successText}</MainBodyText>
			) : (
				<MainForm
					formAction={buildUrl('/verify-email')}
					submitButtonText="Send verification link"
					recaptchaSiteKey={recaptchaSiteKey}
					setRecaptchaErrorMessage={setRecaptchaErrorMessage}
					setRecaptchaErrorContext={setRecaptchaErrorContext}
					disableOnSubmit
					formErrorMessageFromParent={formError}
				>
					<EmailInput defaultValue={email} hidden hideLabel />
				</MainForm>
			)}
		</MinimalLayout>
	);
};

export const ResendEmailVerification = ({
	email,
	signInPageUrl,
	successText,
	recaptchaSiteKey,
	formError,
}: ResendEmailVerificationProps) => {
	if (email) {
		return (
			<LoggedIn
				formError={formError}
				email={email}
				successText={successText}
				recaptchaSiteKey={recaptchaSiteKey}
			/>
		);
	} else {
		return <LoggedOut signInPageUrl={signInPageUrl} />;
	}
};
