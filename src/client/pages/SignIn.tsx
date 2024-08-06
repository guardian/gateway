import { css } from '@emotion/react';
import { remSpace, textSans } from '@guardian/source/foundations';
import { Divider } from '@guardian/source-development-kitchen/react-components';
import React from 'react';
import { AuthProviderButtons } from '@/client/components/AuthProviderButtons';
import { EmailInput } from '@/client/components/EmailInput';
import { InformationBox } from '@/client/components/InformationBox';
import { MainBodyText } from '@/client/components/MainBodyText';
import { MainForm } from '@/client/components/MainForm';
import { PasswordInput } from '@/client/components/PasswordInput';
import { GuardianTerms, JobsTerms } from '@/client/components/Terms';
import ThemedLink from '@/client/components/ThemedLink';
import { MinimalLayout } from '@/client/layouts/MinimalLayout';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { divider } from '@/client/styles/Shared';
import locations from '@/shared/lib/locations';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { SUPPORT_EMAIL } from '@/shared/model/Configuration';
import { RegistrationErrors, SignInErrors } from '@/shared/model/Errors';
import type { QueryParams } from '@/shared/model/QueryParams';

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

const resetPassword = css`
	${textSans.small()}
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
}: SignInProps) => {
	const formTrackingName = 'sign-in';

	// The page level error is equivalent to this enum if social signin has been blocked.
	const socialSigninBlocked = pageError === SignInErrors.SOCIAL_SIGNIN_ERROR;

	const { clientId } = queryParams;
	const isJobs = clientId === 'jobs';

	usePageLoadOphanInteraction(formTrackingName);

	return (
		<MinimalLayout
			errorOverride={pageError}
			errorContext={getErrorContext(pageError, queryParams)}
			pageHeader="Sign in"
			leadText="One account to access all Guardian products."
		>
			{/* AuthProviderButtons component with show boolean */}
			{showAuthProviderButtons(socialSigninBlocked, queryParams, isJobs)}
			<MainForm
				formErrorMessageFromParent={formError}
				formErrorContextFromParent={getErrorContext(formError, queryParams)}
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
				<PasswordInput label="Password" autoComplete="current-password" />
				<ThemedLink
					href={buildUrlWithQueryParams('/reset-password', {}, queryParams)}
					cssOverrides={resetPassword}
				>
					Reset password
				</ThemedLink>
			</MainForm>
			{!isReauthenticate && (
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
