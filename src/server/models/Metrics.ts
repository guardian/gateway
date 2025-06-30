// This file defines the metrics that we would like to track in cloudwatch

import { BucketType } from '@/server/lib/rate-limit';
import { PasswordRoutePath } from '@/shared/model/Routes';
import { IDXPath } from '@/server/lib/okta/idx/shared/paths';
import { Status } from './okta/User';
import { Literal } from '@/shared/types';
import { UserFlow } from '../lib/okta/openid-connect';

// Specific emails to track
type EmailMetrics =
	| 'OktaAccountExists'
	| 'OktaCreatePassword'
	| 'OktaResetPassword'
	| 'OktaUnvalidatedEmailResetPassword';

// Rate limit buckets to track
type RateLimitMetrics = BucketType;

// Any metrics with conditions to append to the end
// i.e ::Success or ::Failure
type ConditionalMetrics =
	| 'BreachedPasswordCheck'
	| 'ChangeEmail'
	| 'ConsentToken'
	| 'ConsentTokenResend'
	| `${EmailMetrics}EmailSend`
	| 'JobsGRSGroupAgree'
	| 'NewAccountReview'
	| 'NewAccountReviewSubmit'
	| 'NewAccountNewslettersSubmit'
	| 'OAuthAuthorization'
	| 'OAuthApplicationCallback'
	| 'OAuthAuthenticationCallback'
	| 'OAuthDeleteCallback'
	| 'OktaAccountVerification'
	| 'OktaDeactivateUser'
	| 'OktaIDXInteract'
	| 'OktaIDXRegister'
	| 'OktaIDXResetPasswordSend'
	| `OktaIDXResetPasswordSend::NON_EXISTENT`
	| `OktaIDXResetPasswordSend::${Literal<typeof Status>}`
	| `OktaIDX::${IDXPath}`
	| 'OktaRegistration'
	| 'OktaRegistrationResendEmail'
	| 'OktaIdxResetPassword'
	| 'OktaResetPassword'
	| 'OktaIdxSetPassword'
	| 'OktaSetPassword'
	| 'OktaSignIn'
	| 'OktaIdxSignIn'
	| 'OktaIdxPasscodeSignIn'
	| 'OktaIdxSendPasscodeSignIn'
	| 'OktaIDXSocialSignIn'
	| 'OktaPasswordSignInFlow'
	| 'OktaSignOut'
	| 'OktaSignOutGlobal'
	| 'OktaUpdatePassword'
	| 'OktaValidatePasswordToken'
	| 'OktaIdxWelcome'
	| 'OktaWelcome'
	| 'OktaWelcomeResendEmail'
	| 'RecaptchaMiddleware'
	| 'SignOut'
	| 'SignOutGlobal'
	| 'Subscribe'
	| 'Unsubscribe'
	| 'UnsubscribeAll';

// Unconditional metrics that we want to track directly
type UnconditionalMetrics =
	| 'PasswordCheck::Breached'
	| 'PasswordCheck::NotBreached'
	| 'LoginMiddlewareOAuth::HasOAuthTokens'
	| 'LoginMiddlewareOAuth::NoOAuthTokens'
	| 'LoginMiddlewareOAuth::NoOktaSession'
	| 'LoginMiddlewareOAuth::OAuthTokensInvalid'
	| 'LoginMiddlewareOAuth::OAuthTokensValid'
	| 'LoginMiddlewareOAuth::SignedOutCookie'
	| 'OAuthAuthorization::ProvisioningFailure'
	| 'OktaIDX::UnexpectedVersion'
	| 'OktaIDXSocialRegistration::Apple'
	| 'OktaIDXSocialRegistration::Google'
	| 'OktaIDXSocialRegistration::Success'
	| 'OktaIDXSocialSignIn::Apple'
	| 'OktaIDXSocialSignIn::Google'
	| 'OktaIDXSocialSignIn::Redirect'
	| 'OktaIDXEmailVerificationDisabled'
	| 'VerifyEmailPage::Accessed'
	| `${RateLimitMetrics}GatewayRateLimitHit`
	| `User-${'EmailValidated' | 'EmailNotValidated'}-${
			| 'WeakPassword'
			| 'StrongPassword'}`
	| `PasscodePasswordNotCompleteRemediation-${'ResetPassword' | 'Register'}-${'STAGED' | 'PROVISIONED'}-${'Start' | 'Complete'}`
	| `ExistingUserInCreateAccountFlow`
	| `UserFlow-${UserFlow}-${string}`;

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
	isPasscode = false,
): Metrics => {
	switch (path) {
		case '/set-password':
			return isPasscode
				? `OktaIdxSetPassword::${type}`
				: `OktaSetPassword::${type}`;
		case '/reset-password':
			return isPasscode
				? `OktaIdxResetPassword::${type}`
				: `OktaResetPassword::${type}`;
		case '/welcome':
			return isPasscode ? `OktaIdxWelcome::${type}` : `OktaWelcome::${type}`;
	}
};
