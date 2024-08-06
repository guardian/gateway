import React from 'react';
import { ChangeEmailCompletePage } from '@/client/pages/ChangeEmailCompletePage';
import { ChangeEmailErrorPage } from '@/client/pages/ChangeEmailErrorPage';
import { ChangePasswordCompletePage } from '@/client/pages/ChangePasswordCompletePage';
import { ChangePasswordPage } from '@/client/pages/ChangePasswordPage';
import { DeleteAccountBlockedPage } from '@/client/pages/DeleteAccountBlockedPage';
import { DeleteAccountCompletePage } from '@/client/pages/DeleteAccountCompletePage';
import { DeleteAccountEmailPasswordValidationPage } from '@/client/pages/DeleteAccountEmailPasswordValidationPage';
import { DeleteAccountPage } from '@/client/pages/DeleteAccountPage';
import { EmailSentPage } from '@/client/pages/EmailSentPage';
import { JobsTermsPage } from '@/client/pages/JobsTermsAcceptPage';
import { MaintenancePage } from '@/client/pages/MaintenancePage';
import { NewAccountNewslettersPage } from '@/client/pages/NewAccountNewslettersPage';
import { NewAccountReviewPage } from '@/client/pages/NewAccountReviewPage';
import { NotFoundPage } from '@/client/pages/NotFoundPage';
import { RegisterWithEmailPage } from '@/client/pages/RegisterWithEmailPage';
import { RegistrationEmailSentPage } from '@/client/pages/RegistrationEmailSentPage';
import { RegistrationPage } from '@/client/pages/RegistrationPage';
import { ResendConsentEmailPage } from '@/client/pages/ResendConsentEmailPage';
import { ResendPasswordPage } from '@/client/pages/ResendPasswordPage';
import { ResetPasswordPage } from '@/client/pages/ResetPasswordPage';
import { ResetPasswordSessionExpiredPage } from '@/client/pages/ResetPasswordSessionExpiredPage';
import { ReturnToAppPage } from '@/client/pages/ReturnToAppPage';
import { SetPasswordCompletePage } from '@/client/pages/SetPasswordCompletePage';
import { SetPasswordPage } from '@/client/pages/SetPasswordPage';
import { SetPasswordResendPage } from '@/client/pages/SetPasswordResendPage';
import { SetPasswordSessionExpiredPage } from '@/client/pages/SetPasswordSessionExpiredPage';
import { SignedInAsPage } from '@/client/pages/SignedInAsPage';
import { SignInPage } from '@/client/pages/SignInPage';
import { SubscriptionErrorPage } from '@/client/pages/SubscriptionErrorPage';
import { SubscriptionSuccessPage } from '@/client/pages/SubscriptionSuccessPage';
import { UnexpectedErrorPage } from '@/client/pages/UnexpectedErrorPage';
import { UnvalidatedEmailEmailSentPage } from '@/client/pages/UnvalidatedEmailEmailSentPage';
import { WelcomePage } from '@/client/pages/WelcomePage';
import { WelcomePasswordAlreadySetPage } from '@/client/pages/WelcomePasswordAlreadySetPage';
import { WelcomeResendPage } from '@/client/pages/WelcomeResendPage';
import { WelcomeSessionExpiredPage } from '@/client/pages/WelcomeSessionExpiredPage';
import { WelcomeSocialPage } from '@/client/pages/WelcomeSocialPage';
import { parse } from '@/shared/lib/regexparam';
import type { ClientState } from '@/shared/model/ClientState';
import type { RoutePaths } from '@/shared/model/Routes';
import { VerifyEmailResetPasswordPage } from './pages/VerifyEmailResetPasswordPage';

export type RoutingConfig = {
	clientState: ClientState;
	location: string;
};

const routes: Array<{
	path: RoutePaths;
	element: React.ReactElement;
}> = [
	{
		path: '/signed-in-as',
		element: <SignedInAsPage />,
	},
	{
		path: '/signin',
		element: <SignInPage />,
	},
	{
		path: '/signin/email-sent',
		element: (
			<UnvalidatedEmailEmailSentPage formTrackingName="unvalidated-email-resend" />
		),
	},
	{
		path: '/reauthenticate',
		element: <SignInPage isReauthenticate />,
	},
	{
		path: '/register',
		element: <RegistrationPage />,
	},
	{
		path: '/register/email',
		element: <RegisterWithEmailPage />,
	},
	{
		path: '/register/email-sent',
		element: <RegistrationEmailSentPage />,
	},
	{
		path: '/reset-password',
		element: <ResetPasswordPage />,
	},
	{
		path: '/reset-password/email-sent',
		element: (
			<EmailSentPage formTrackingName="forgot-password-resend" noAccountInfo />
		),
	},
	{
		path: '/reset-password/complete',
		element: <ChangePasswordCompletePage />,
	},
	{
		path: '/reset-password/resend',
		element: <ResendPasswordPage />,
	},
	{
		path: '/reset-password/expired',
		element: <ResetPasswordSessionExpiredPage />,
	},
	{
		path: '/reset-password/:token',
		element: <ChangePasswordPage />,
	},
	{
		path: '/set-password/resend',
		element: <SetPasswordResendPage />,
	},
	{
		path: '/set-password/expired',
		element: <SetPasswordSessionExpiredPage />,
	},
	{
		path: '/set-password/complete',
		element: <SetPasswordCompletePage />,
	},
	{
		path: '/set-password/email-sent',
		element: <EmailSentPage formTrackingName="set-password-resend" />,
	},
	{
		path: '/set-password/:token',
		element: <SetPasswordPage />,
	},
	{
		path: '/welcome/resend',
		element: <WelcomeResendPage />,
	},
	{
		path: '/welcome/expired',
		element: <WelcomeSessionExpiredPage />,
	},
	{
		path: '/welcome/email-sent',
		element: <EmailSentPage formTrackingName="welcome-resend" />,
	},
	{
		path: '/welcome/complete',
		element: <WelcomePasswordAlreadySetPage />,
	},
	{
		path: '/welcome/google',
		element: <WelcomeSocialPage socialProvider="google" />,
	},
	{
		path: '/welcome/apple',
		element: <WelcomeSocialPage socialProvider="apple" />,
	},
	{
		path: '/welcome/review',
		element: <NewAccountReviewPage />,
	},
	{
		path: '/welcome/newsletters',
		element: <NewAccountNewslettersPage />,
	},
	{
		path: '/welcome/:token',
		element: <WelcomePage />,
	},
	{
		path: '/welcome/:app/complete',
		element: <ReturnToAppPage />,
	},
	{
		path: '/agree/GRS',
		element: <JobsTermsPage />,
	},
	{
		path: '/verify-email',
		element: <VerifyEmailResetPasswordPage />,
	},
	{
		path: '/change-email/complete',
		element: <ChangeEmailCompletePage />,
	},
	{
		path: '/change-email/error',
		element: <ChangeEmailErrorPage />,
	},
	{
		path: '/unsubscribe/success',
		element: <SubscriptionSuccessPage action={'unsubscribe'} />,
	},
	{
		path: '/unsubscribe/error',
		element: <SubscriptionErrorPage action={'unsubscribe'} />,
	},
	{
		path: '/subscribe/success',
		element: <SubscriptionSuccessPage action={'subscribe'} />,
	},
	{
		path: '/subscribe/error',
		element: <SubscriptionErrorPage action={'subscribe'} />,
	},
	{
		path: '/error',
		element: <UnexpectedErrorPage />,
	},
	{
		path: '/404',
		element: <NotFoundPage />,
	},
	{
		path: '/maintenance',
		element: <MaintenancePage />,
	},
	{
		path: '/consent-token/error',
		element: <ResendConsentEmailPage />,
	},
	{
		path: '/consent-token/email-sent',
		element: <EmailSentPage formTrackingName="consent-resend" />,
	},
	{
		path: '/delete',
		element: <DeleteAccountPage />,
	},
	{
		path: '/delete/complete',
		element: <DeleteAccountCompletePage />,
	},
	{
		path: '/delete-blocked',
		element: <DeleteAccountBlockedPage />,
	},
	{
		path: '/delete-email-validation',
		element: (
			<DeleteAccountEmailPasswordValidationPage validationType="email" />
		),
	},
	{
		path: '/delete-set-password',
		element: (
			<DeleteAccountEmailPasswordValidationPage validationType="password" />
		),
	},
	{
		path: '/delete/email-sent',
		element: <EmailSentPage />,
	},
];

interface Props {
	location: string;
}

export const GatewayRoutes = ({ location }: Props) => {
	for (const route of routes) {
		if (parse(route.path).pattern.test(location)) {
			return route.element;
		}
	}
	return <NotFoundPage />;
};
