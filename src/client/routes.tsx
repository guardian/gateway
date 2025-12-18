import React from 'react';
import { ChangeEmailCompletePage } from '@/client/pages/ChangeEmailCompletePage';
import { ChangeEmailErrorPage } from '@/client/pages/ChangeEmailErrorPage';
import { ChangePasswordCompletePage } from '@/client/pages/ChangePasswordCompletePage';
import { ChangePasswordPage } from '@/client/pages/ChangePasswordPage';
import { ClientState } from '@/shared/model/ClientState';
import { DeleteAccountBlockedPage } from '@/client/pages/DeleteAccountBlockedPage';
import { DeleteAccountCompletePage } from '@/client/pages/DeleteAccountCompletePage';
import { DeleteAccountEmailPasswordValidationPage } from '@/client/pages/DeleteAccountEmailPasswordValidationPage';
import { DeleteAccountPage } from '@/client/pages/DeleteAccountPage';
import { EmailSentPage } from '@/client/pages/EmailSentPage';
import { IframedPasscodeEmailSentPage } from './pages/IframedPasscodeEmailSentPage';
import { IframedSignInPage } from './pages/IframedSignInPage';
import { JobsTermsPage } from '@/client/pages/JobsTermsAcceptPage';
import { MaintenancePage } from '@/client/pages/MaintenancePage';
import { NewAccountConsentsPage } from './pages/NewAccountConsentsPage';
import { NewAccountNewslettersPage } from '@/client/pages/NewAccountNewslettersPage';
import { NewAccountReviewPage } from '@/client/pages/NewAccountReviewPage';
import { NotFoundPage } from '@/client/pages/NotFoundPage';
import { PasscodeEmailSentPage } from './pages/PasscodeEmailSentPage';
import { PasscodeUsedRegisterPage } from './pages/PasscodeUsedRegisterPage';
import { RegisterWithEmailPage } from '@/client/pages/RegisterWithEmailPage';
import { RegistrationEmailSentPage } from './pages/RegistrationEmailSentPage';
import { RegistrationPage } from '@/client/pages/RegistrationPage';
import { ResendConsentEmailPage } from '@/client/pages/ResendConsentEmailPage';
import { ResendPasswordPage } from '@/client/pages/ResendPasswordPage';
import { ResetPasswordEmailSentPage } from '@/client/pages/ResetPasswordEmailSentPage';
import { ResetPasswordPage } from '@/client/pages/ResetPasswordPage';
import { ResetPasswordSessionExpiredPage } from '@/client/pages/ResetPasswordSessionExpiredPage';
import { ReturnToAppPage } from '@/client/pages/ReturnToAppPage';
import { RoutePaths } from '@/shared/model/Routes';
import { SetPasswordCompletePage } from '@/client/pages/SetPasswordCompletePage';
import { SetPasswordPage } from '@/client/pages/SetPasswordPage';
import { SetPasswordResendPage } from '@/client/pages/SetPasswordResendPage';
import { SetPasswordSessionExpiredPage } from '@/client/pages/SetPasswordSessionExpiredPage';
import { SignInPage } from '@/client/pages/SignInPage';
import { SignInPasscodeEmailSentPage } from './pages/SignInPasscodeEmailSentPage';
import { SignedInAsPage } from '@/client/pages/SignedInAsPage';
import { SubscriptionErrorPage } from '@/client/pages/SubscriptionErrorPage';
import { SubscriptionSuccessPage } from '@/client/pages/SubscriptionSuccessPage';
import { UnexpectedErrorPage } from '@/client/pages/UnexpectedErrorPage';
import { UnvalidatedEmailEmailSentPage } from '@/client/pages/UnvalidatedEmailEmailSentPage';
import { VerifyEmailResetPasswordPage } from '@/client/pages/VerifyEmailResetPasswordPage';
import { WelcomeExistingPage } from '@/client/pages/WelcomeExistingPage';
import { WelcomePage } from '@/client/pages/WelcomePage';
import { WelcomePasswordAlreadySetPage } from '@/client/pages/WelcomePasswordAlreadySetPage';
import { WelcomeResendPage } from '@/client/pages/WelcomeResendPage';
import { WelcomeSessionExpiredPage } from '@/client/pages/WelcomeSessionExpiredPage';
import { WelcomeSocialPage } from '@/client/pages/WelcomeSocialPage';
import { parse } from '@/shared/lib/regexparam';
import { IframedRegisterWithEmailPage } from './pages/IframedRegisterWithEmailPage';
import { SubscriptionReviewPage } from './pages/SubscriptionReviewPage';

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
		path: '/passcode',
		element: <PasscodeEmailSentPage />,
	},
	{
		path: '/passcode/resend',
		element: <EmailSentPage formTrackingName="passcode-email-resend" />,
	},
	{
		path: '/passcode-used-register',
		element: <PasscodeUsedRegisterPage />,
	},
	{
		path: '/signin/code',
		element: <SignInPasscodeEmailSentPage />,
	},
	{
		path: '/register/email-sent',
		element: <RegistrationEmailSentPage />,
	},
	{
		path: '/signin/password',
		element: <SignInPage hideSocialButtons forcePasswordPage />,
	},
	{
		path: '/reauthenticate',
		element: <SignInPage isReauthenticate />,
	},
	{
		path: '/reauthenticate/password',
		element: (
			<SignInPage isReauthenticate hideSocialButtons forcePasswordPage />
		),
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
		path: '/reset-password',
		element: <ResetPasswordPage />,
	},
	{
		path: '/reset-password/email-sent',
		element: <ResetPasswordEmailSentPage />,
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
		path: '/iframed/signin',
		element: <IframedSignInPage />,
	},
	{
		path: '/iframed/register/email',
		element: <IframedRegisterWithEmailPage />,
	},
	{
		path: '/iframed/passcode',
		element: <IframedPasscodeEmailSentPage />,
	},
	{
		path: '/welcome/resend',
		element: <WelcomeResendPage />,
	},
	{
		path: '/welcome/existing',
		element: <WelcomeExistingPage />,
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
		element: <WelcomeSocialPage />,
	},
	{
		path: '/welcome/apple',
		element: <WelcomeSocialPage />,
	},
	{
		path: '/welcome/complete-account',
		element: <NewAccountConsentsPage />,
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
		path: '/unsubscribe/review',
		element: <SubscriptionReviewPage action={'unsubscribe'} />,
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
		path: '/subscribe/review',
		element: <SubscriptionReviewPage action={'subscribe'} />,
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
	const locationWithoutParams = location.includes('?')
		? location.substring(0, location.indexOf('?'))
		: location;

	for (const route of routes) {
		if (parse(route.path).pattern.test(locationWithoutParams)) {
			return route.element;
		}
	}
	return <NotFoundPage />;
};
