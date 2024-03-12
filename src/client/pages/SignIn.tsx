import React from 'react';
import { SignInErrors } from '@/shared/model/Errors';
import { QueryParams } from '@/shared/model/QueryParams';
import { MainForm } from '@/client/components/MainForm';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { EmailInput } from '@/client/components/EmailInput';
import { PasswordInput } from '@/client/components/PasswordInput';
import { css } from '@emotion/react';
import { from, space, textSans } from '@guardian/source-foundations';
import { Link } from '@guardian/source-react-components';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { AuthProviderButtons } from '@/client/components/AuthProviderButtons';
import { divider, socialButtonDivider } from '@/client/styles/Shared';
import { GuardianTerms, JobsTerms } from '@/client/components/Terms';
import { MainBodyText } from '@/client/components/MainBodyText';
import { InformationBox } from '@/client/components/InformationBox';
import { MinimalLayout } from '../layouts/MinimalLayout';

export type SignInProps = {
	queryParams: QueryParams;
	email?: string;
	// An error to be displayed at the top of the page
	pageError?: string;
	// An error to be displayed at the top of the MainForm component
	formError?: string;
	recaptchaSiteKey: string;
	isReauthenticate?: boolean;
};

const passwordInput = css`
	margin-top: ${space[2]}px;

	${from.mobileMedium} {
		margin-top: ${space[3]}px;
	}
`;

const resetPassword = css`
	${textSans.small()}
`;

const Links = ({ children }: { children: React.ReactNode }) => (
	<div
		css={css`
			margin-top: ${space[2]}px;
			${from.tablet} {
				margin-top: 6px;
			}
		`}
	>
		{children}
	</div>
);

const getErrorContext = (error: string | undefined) => {
	if (error === SignInErrors.ACCOUNT_ALREADY_EXISTS) {
		return (
			<>
				We cannot sign you in with your social account credentials. Please enter
				your account password below to sign in.
			</>
		);
	}
};

const showAuthProviderButtons = (
	socialSigninBlocked: boolean,
	queryParams: QueryParams,
	isJobs: boolean,
) => {
	if (socialSigninBlocked === false) {
		return (
			<>
				<InformationBox withMarginTop>
					{!isJobs && <GuardianTerms />}
					{isJobs && <JobsTerms />}
				</InformationBox>
				<AuthProviderButtons
					queryParams={queryParams}
					marginTop={true}
					providers={['social']}
				/>
				<Divider
					spaceAbove="loose"
					displayText="or continue with"
					cssOverrides={socialButtonDivider}
				/>
			</>
		);
	}
};

export const SignIn = ({
	email,
	pageError,
	formError,
	queryParams,
	recaptchaSiteKey,
	isReauthenticate = false,
}: SignInProps) => {
	const formTrackingName = 'sign-in';

	// The page level error is equivalent to this enum if social signin has been blocked.
	const socialSigninBlocked = pageError === SignInErrors.ACCOUNT_ALREADY_EXISTS;

	const { clientId } = queryParams;
	const isJobs = clientId === 'jobs';

	usePageLoadOphanInteraction(formTrackingName);

	return (
		<MinimalLayout
			errorOverride={pageError}
			errorContext={getErrorContext(pageError)}
			// errorSmallMarginBottom={!!pageError}
			pageHeader="Sign in"
			pageSubText="One account to access all Guardian products."
		>
			{/* AuthProviderButtons component with show boolean */}
			{showAuthProviderButtons(socialSigninBlocked, queryParams, isJobs)}
			<MainForm
				formErrorMessageFromParent={formError}
				formErrorContextFromParent={getErrorContext(formError)}
				formAction={buildUrlWithQueryParams(
					isReauthenticate ? '/reauthenticate' : '/signin',
					{},
					queryParams,
				)}
				submitButtonText="Sign in"
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formTrackingName}
				disableOnSubmit
				// If social signin is blocked, terms and conditions appear inside MainForm
				// instead of being handled by showAuthProviderButtons(), above.
				hasGuardianTerms={!isJobs && socialSigninBlocked}
				hasJobsTerms={isJobs && socialSigninBlocked}
			>
				<EmailInput defaultValue={email} />
				<div css={passwordInput}>
					<PasswordInput label="Password" autoComplete="current-password" />
				</div>
				<Links>
					<Link
						href={buildUrlWithQueryParams('/reset-password', {}, queryParams)}
						cssOverrides={resetPassword}
					>
						Reset password
					</Link>
				</Links>
			</MainForm>
			{/* divider */}
			<Divider spaceAbove="tight" size="full" cssOverrides={divider} />
			<MainBodyText>
				Not signed in before?{' '}
				<Link href={buildUrlWithQueryParams('/register', {}, queryParams)}>
					Create a free account
				</Link>
			</MainBodyText>
		</MinimalLayout>
	);
};
