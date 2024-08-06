import { css } from '@emotion/react';
import React from 'react';
import { EmailInput } from '@/client/components/EmailInput';
import { ExternalLink } from '@/client/components/ExternalLink';
import {
	InformationBox,
	InformationBoxText,
} from '@/client/components/InformationBox';
import { MainForm } from '@/client/components/MainForm';
import ThemedLink from '@/client/components/ThemedLink';
import type { EmailSentProps } from '@/client/pages/EmailSent';
import locations from '@/shared/lib/locations';
import { buildUrl } from '@/shared/lib/routeUtils';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';

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
> & {
	setRecaptchaErrorContext: React.Dispatch<
		React.SetStateAction<React.ReactNode>
	>;
	setRecaptchaErrorMessage: React.Dispatch<React.SetStateAction<string>>;
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
}: EmailSentInformationBoxProps) => (
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
);
