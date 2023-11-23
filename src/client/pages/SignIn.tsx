import React from 'react';
import { SignInErrors } from '@/shared/model/Errors';
import { QueryParams } from '@/shared/model/QueryParams';
import { generateSignInRegisterTabs } from '@/client/components/Nav';
import { MainLayout } from '@/client/layouts/Main';
import { MainForm } from '@/client/components/MainForm';
import { buildUrlWithQueryParams } from '@/shared/lib/routeUtils';
import { usePageLoadOphanInteraction } from '@/client/lib/hooks/usePageLoadOphanInteraction';
import { EmailInput } from '@/client/components/EmailInput';
import { PasswordInput } from '@/client/components/PasswordInput';
import { css } from '@emotion/react';
import { from, space, textSans } from '@guardian/source-foundations';
import { Link } from '@guardian/source-react-components';
import { Divider } from '@guardian/source-react-components-development-kitchen';
import { SocialButtons } from '@/client/components/SocialButtons';
import { socialButtonDivider } from '@/client/styles/Shared';
import {
	GuardianTerms,
	JobsTerms,
	termsContainer,
} from '@/client/components/Terms';

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

const showSocialButtons = (
	socialSigninBlocked: boolean,
	queryParams: QueryParams,
	isJobs: boolean,
) => {
	if (socialSigninBlocked === false) {
		return (
			<>
				<div css={termsContainer}>
					{!isJobs && <GuardianTerms />}
					{isJobs && <JobsTerms />}
				</div>
				<SocialButtons
					queryParams={queryParams}
					marginTop={true}
					context="Sign in"
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

	const tabs = generateSignInRegisterTabs({
		isActive: 'signin',
		isReauthenticate,
		queryParams,
	});

	return (
		<MainLayout
			errorOverride={pageError}
			errorContext={getErrorContext(pageError)}
			tabs={tabs}
			errorSmallMarginBottom={!!pageError}
		>
			{/* SocialButtons component with show boolean */}
			{showSocialButtons(socialSigninBlocked, queryParams, isJobs)}
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
				// instead of being handled by showSocialButtons(), above.
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
		</MainLayout>
	);
};
