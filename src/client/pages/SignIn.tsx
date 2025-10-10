import React from 'react';
import {
	extractMessage,
	GatewayError,
	PasscodeErrors,
	RegistrationErrors,
	SignInErrors,
} from '@/shared/model/Errors';
import { QueryParams } from '@/shared/model/QueryParams';
import { MainForm } from '@/client/components/MainForm';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { EmailInput } from '@/client/components/EmailInput';
import { PasswordInput } from '@/client/components/PasswordInput';
import { css } from '@emotion/react';
import { Divider } from '@guardian/source-development-kitchen/react-components';
import { remSpace, textSans15 } from '@guardian/source/foundations';
import { AuthProviderButtons } from '@/client/components/AuthProviderButtons';
import { divider } from '@/client/styles/Shared';
import { GuardianTerms, JobsTerms } from '@/client/components/Terms';
import { MainBodyText } from '@/client/components/MainBodyText';
import { InformationBox } from '@/client/components/InformationBox';
import locations from '@/shared/lib/locations';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import ThemedLink from '@/client/components/ThemedLink';

export type SignInProps = {
	queryParams: QueryParams;
	email?: string;
	// An error to be displayed at the top of the page
	pageError?: string;
	// An error to be displayed at the top of the MainForm component
	formError?: GatewayError;
	recaptchaSiteKey: string;
	isReauthenticate?: boolean;
	shortRequestId?: string;
	// flag to determine whether to show the passcode view or password view
	usePasscodeSignIn?: boolean;
	hideSocialButtons?: boolean;
	focusPasswordField?: boolean;
};

const resetPassword = css`
	${textSans15}
`;

const socialButtonDivider = css`
	margin-top: ${remSpace[2]};
	margin-bottom: 0;
	color: var(--color-divider);
	:before,
	:after {
		content: '';
		flex: 1 1;
		border-bottom: 1px solid var(--color-divider);
		margin: 8px;
	}
`;

const getErrorContext = (
	error: string | undefined,
	queryParams: QueryParams,
) => {
	if (error === SignInErrors.SOCIAL_SIGNIN_ERROR) {
		return (
			<>
				<div>
					We could not sign you in with your social account credentials. Please
					sign in with your email below. If you do not know your password, you
					can{' '}
					<ThemedLink
						href={buildUrlWithQueryParams('/reset-password', {}, queryParams)}
					>
						reset it here
					</ThemedLink>
					.
				</div>
				<br />
				<div>
					If you are still having trouble, please contact our customer service
					team at{' '}
					<ThemedLink href={locations.SUPPORT_EMAIL_MAILTO}>
						{SUPPORT_EMAIL}
					</ThemedLink>
					.
				</div>
			</>
		);
	} else if (error === RegistrationErrors.PROVISIONING_FAILURE) {
		return (
			<>
				Please try signing in with your new account. If you are still having
				trouble, please contact our customer service team at{' '}
				<a href={locations.SUPPORT_EMAIL_MAILTO}>{SUPPORT_EMAIL}</a>
			</>
		);
	} else if (error === PasscodeErrors.PASSCODE_EXPIRED) {
		return (
			<>
				<div>Please request a new one-time code to sign in.</div>
				<br />
				<div>
					If you are still having trouble, please contact our customer service
					team at{' '}
					<ThemedLink href={locations.SUPPORT_EMAIL_MAILTO}>
						{SUPPORT_EMAIL}
					</ThemedLink>
					.
				</div>
			</>
		);
	}
};

const showAuthProviderButtons = (
	socialSigninBlocked: boolean,
	queryParams: QueryParams,
	isJobs: boolean,
) => {
	if (!socialSigninBlocked) {
		return (
			<>
				<InformationBox>
					{!isJobs && <GuardianTerms />}
					{isJobs && <JobsTerms />}
				</InformationBox>
				<AuthProviderButtons queryParams={queryParams} providers={['social']} />
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
	shortRequestId,
	usePasscodeSignIn = false,
	hideSocialButtons = false,
	focusPasswordField = false,
}: SignInProps) => {
	const [currentEmail, setCurrentEmail] = React.useState(email);

	// status of the OTP checkbox
	const selectedView = usePasscodeSignIn ? 'passcode' : 'password';

	const formTrackingName = 'sign-in';

	// The page level error is equivalent to this enum if social signin has been blocked.
	const socialSigninBlocked = pageError === SignInErrors.SOCIAL_SIGNIN_ERROR;

	const { clientId } = queryParams;
	const isJobs = clientId === 'jobs';
	const formErrorMessage = extractMessage(formError);
	usePageLoadOphanInteraction(formTrackingName);

	return (
		<MinimalLayout
			shortRequestId={shortRequestId}
			errorOverride={pageError}
			errorContext={getErrorContext(pageError, queryParams)}
			pageHeader={
				isReauthenticate || !usePasscodeSignIn
					? 'Sign in'
					: 'Sign in or create an account'
			}
			leadText="One account to access all Guardian products."
		>
			{/* AuthProviderButtons component with show boolean */}
			{!hideSocialButtons &&
				showAuthProviderButtons(socialSigninBlocked, queryParams, isJobs)}
			<MainForm
				shortRequestId={shortRequestId}
				formErrorMessageFromParent={formError}
				formErrorContextFromParent={getErrorContext(
					formErrorMessage,
					queryParams,
				)}
				formAction={buildUrlWithQueryParams(
					isReauthenticate ? '/reauthenticate' : '/signin',
					{},
					queryParams,
				)}
				submitButtonText={
					selectedView === 'passcode' ? 'Continue with email' : 'Sign in'
				}
				recaptchaSiteKey={recaptchaSiteKey}
				formTrackingName={formTrackingName}
				disableOnSubmit
				// If social signin is blocked, terms and conditions appear inside MainForm
				// instead of being handled by showAuthProviderButtons(), above.
				hasGuardianTerms={!isJobs && socialSigninBlocked}
				hasJobsTerms={isJobs && socialSigninBlocked}
			>
				<input
					type="hidden"
					name="isCombinedSigninAndRegisterFlow"
					value="combined"
				/>
				<EmailInput
					defaultValue={email}
					onChange={(e) => setCurrentEmail(e.target.value)}
				/>
				{selectedView === 'password' && (
					<>
						<PasswordInput
							label="Password"
							autoComplete="current-password"
							autoFocus={!!(focusPasswordField && email)}
						/>
						<ThemedLink
							href={buildUrlWithQueryParams('/reset-password', {}, queryParams)}
							cssOverrides={resetPassword}
						>
							Reset password
						</ThemedLink>
					</>
				)}
				{
					// Hidden input to determine whether passcode view is selected
					selectedView === 'passcode' && (
						<input type="hidden" name="passcode" value="passcode" />
					)
				}
			</MainForm>
			{
				// Hidden input to determine whether passcode view is selected
				selectedView === 'passcode' && (
					<>
						<MainBodyText>
							<ThemedLink
								href={buildUrlWithQueryParams(
									isReauthenticate
										? '/reauthenticate/password'
										: '/signin/password',
									{},
									queryParams,
									{
										signInEmail: currentEmail,
									},
								)}
							>
								Sign in with a password instead
							</ThemedLink>
						</MainBodyText>
					</>
				)
			}
			{!isReauthenticate && selectedView !== 'passcode' && (
				<>
					<Divider size="full" cssOverrides={divider} />
					<MainBodyText>
						Not signed in before?{' '}
						<ThemedLink
							href={buildUrlWithQueryParams('/register', {}, queryParams)}
						>
							Create a free account
						</ThemedLink>
					</MainBodyText>
				</>
			)}
		</MinimalLayout>
	);
};
