// This file defines the metrics that we would like to track in cloudwatch

import { BucketType } from '@/server/lib/rate-limit';
import { PasswordRoutePath } from '@/shared/model/Routes';
import { IDXPath } from '@/server/lib/okta/idx/shared';

// Specific emails to track
type EmailMetrics =
	| 'AccountExists'
	| 'AccountExistsWithoutPassword'
	| 'AccountVerification'
	| 'CreatePassword'
	| 'ResetPassword'
	| 'OktaAccountExists'
	| 'OktaAccountExistsWithoutPassword'
	| 'OktaCompleteRegistration'
	| 'OktaCreatePassword'
	| 'OktaResetPassword'
	| 'OktaUnvalidatedEmailResetPassword'
	| 'GuardianLiveOffer'
	| 'MyGuardianOffer';

// Rate limit buckets to track
type RateLimitMetrics = BucketType;

// Any metrics with conditions to append to the end
// i.e ::Success or ::Failure
type ConditionalMetrics =
	| 'AccountVerification'
	| 'BreachedPasswordCheck'
	| 'ChangeEmail'
	| 'ConsentToken'
	| 'ConsentTokenResend'
	| `${EmailMetrics}EmailSend`
	| 'EmailValidated'
	| 'NewAccountReview'
	| 'NewAccountReviewSubmit'
	| 'NewAccountNewslettersSubmit'
	| 'JobsGRSGroupAgree'
	| 'LoginMiddleware'
	| 'OAuthAuthorization'
	| 'OAuthApplicationCallback'
	| 'OAuthAuthenticationCallback'
	| 'OAuthDeleteCallback'
	| 'OktaAccountVerification'
	| 'OktaIDXInteract'
	| `OktaIDX::${IDXPath}`
	| 'OktaRegistration'
	| 'OktaRegistrationResendEmail'
	| 'OktaResetPassword'
	| 'OktaSetPassword'
	| 'OktaSignIn'
	| 'OktaSignOut'
	| 'OktaSignOutGlobal'
	| 'OktaUpdatePassword'
	| 'OktaValidatePasswordToken'
	| 'OktaWelcome'
	| 'OktaWelcomeResendEmail'
	| 'Register'
	| 'SendValidationEmail'
	| 'SignIn'
	| 'SignOut'
	| 'SignOutGlobal'
	| 'Unsubscribe'
	| 'Subscribe'
	| 'UpdatePassword'
	| 'RecaptchaMiddleware'
	| 'ValidatePasswordToken';

// Unconditional metrics that we want to track directly
type UnconditionalMetrics =
	| 'PasswordCheck::Breached'
	| 'PasswordCheck::NotBreached'
	| 'LoginMiddlewareNotRecent'
	| 'LoginMiddlewareNotSignedIn'
	| 'LoginMiddlewareUnverified'
	| 'LoginMiddlewareOAuth::HasOAuthTokens'
	| 'LoginMiddlewareOAuth::NoOAuthTokens'
	| 'LoginMiddlewareOAuth::NoOktaSession'
	| 'LoginMiddlewareOAuth::OAuthTokensInvalid'
	| 'LoginMiddlewareOAuth::OAuthTokensValid'
	| 'LoginMiddlewareOAuth::SignedOutCookie'
	| 'LoginMiddlewareOAuth::UseIdapi'
	| 'OAuthAuthorization::ProvisioningFailure'
	| 'OktaIDX::UnexpectedVersion'
	| 'OktaIDXSocialSignIn::Redirect'
	| 'OktaIDXSocialSignIn::Failure'
	| `${RateLimitMetrics}GatewayRateLimitHit`
	| `User-${'EmailValidated' | 'EmailNotValidated'}-${
			| 'WeakPassword'
			| 'StrongPassword'}`;

// Combine all the metrics above together into a type
export type Metrics =
	| `${ConditionalMetrics}::${'Success' | 'Failure'}`
	| UnconditionalMetrics;

// type safe helper method for email sending metrics
export const emailSendMetric = (
	email: EmailMetrics,
	type: 'Success' | 'Failure',
): Metrics => `${email}EmailSend::${type}`;

export const rateLimitHitMetric = (bucketType: RateLimitMetrics): Metrics =>
	`${bucketType}GatewayRateLimitHit`;

export const changePasswordMetric = (
	path: PasswordRoutePath,
	type: 'Success' | 'Failure',
): Metrics => {
	switch (path) {
		case '/set-password':
			return `OktaSetPassword::${type}`;
		case '/reset-password':
			return `OktaResetPassword::${type}`;
		case '/welcome':
			return `OktaWelcome::${type}`;
	}
};
