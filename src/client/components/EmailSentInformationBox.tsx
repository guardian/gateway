import React from 'react';
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
import ThemedLink from '@/client/components/ThemedLink';
import { EmailSentProps } from '@/client/pages/EmailSent';
import { useCountdownTimer } from '@/client/lib/hooks/useCountdownTimer';

type EmailSentInformationBoxProps = Pick<
	EmailSentProps,
	| 'email'
	| 'resendEmailAction'
	| 'queryString'
	| 'noAccountInfo'
	| 'changeEmailPage'
	| 'recaptchaSiteKey'
	| 'formTrackingName'
	| 'formError'
	| 'shortRequestId'
> & {
	setRecaptchaErrorContext: React.Dispatch<
		React.SetStateAction<React.ReactNode>
	>;
	setRecaptchaErrorMessage: React.Dispatch<React.SetStateAction<string>>;
	sendAgainTimerInSeconds?: number;
	showSignInWithPasswordOption?: boolean;
};

const sendAgainFormWrapperStyles = css`
	white-space: nowrap;
`;

export const EmailSentInformationBox = ({
	email,
	resendEmailAction,
	noAccountInfo,
	changeEmailPage,
	recaptchaSiteKey,
	formTrackingName,
	formError,
	setRecaptchaErrorContext,
	setRecaptchaErrorMessage,
	queryString,
	shortRequestId,
	sendAgainTimerInSeconds,
	showSignInWithPasswordOption,
}: EmailSentInformationBoxProps) => {
	const timer = useCountdownTimer(sendAgainTimerInSeconds || 0);

	return (
		<InformationBox>
			<InformationBoxText>
				Didn’t get the email? Check your spam&#8288;
				{email && resendEmailAction && (
					<span css={sendAgainFormWrapperStyles}>
						,{!changeEmailPage ? <> or </> : <> </>}
						{sendAgainTimerInSeconds && !timer.isComplete ? (
							<span>
								{' '}
								send again after {timer.timeRemaining} second
								{timer.timeRemaining > 1 ? 's' : ''}
							</span>
						) : (
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
								shortRequestId={shortRequestId}
								disabled={!!(sendAgainTimerInSeconds && !timer.isComplete)}
							>
								<EmailInput defaultValue={email} hidden hideLabel />
							</MainForm>
						)}
					</span>
				)}
				{changeEmailPage && (
					<>
						,{!showSignInWithPasswordOption ? <> or </> : <> </>}
						<ThemedLink href={`${changeEmailPage}${queryString}`}>
							try another address
						</ThemedLink>
					</>
				)}
				{showSignInWithPasswordOption && (
					<>
						, or{' '}
						<ThemedLink href={`${buildUrl('/signin/password')}${queryString}`}>
							sign in with a password instead
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
	);
};
