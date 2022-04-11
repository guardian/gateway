// This file defines the metrics that we would like to track in cloudwatch

import { BucketType } from '@/server/lib/rate-limit';

// Specific emails to track
type EmailMetrics =
  | 'AccountExists'
  | 'AccountExistsWithoutPassword'
  | 'AccountVerification'
  | 'CreatePassword'
  | 'ResetPassword'
  | 'OktaResetPassword';

// Rate limit buckets to track
type RateLimitMetrics = BucketType;

// Any metrics with conditions to append to the end
// i.e ::Success or ::Failure
type ConditionalMetrics =
  | 'AccountVerification'
  | `${EmailMetrics}EmailSend`
  | 'EmailValidated'
  | `${'Get' | 'Post'}ConsentsPage-${string}`
  | 'LoginMiddleware'
  | 'OAuthAuthorization'
  | 'OktaRegistration'
  | 'OktaRegistrationResendEmail'
  | 'OktaSignIn'
  | 'OktaSignOut'
  | 'OktaUpdatePassword'
  | 'OktaValidatePasswordToken'
  | 'OktaWelcomeResendEmail'
  | 'PostSignInPrompt'
  | 'PostSignInPromptRedirect'
  | 'Register'
  | 'SendMagicLink'
  | 'SendValidationEmail'
  | 'SignIn'
  | 'SignOut'
  | 'UpdatePassword'
  | 'RecaptchaMiddleware'
  | 'ValidatePasswordToken';

// Unconditional metrics that we want to track directly
type UnconditionalMetrics =
  | 'LoginMiddlewareNotRecent'
  | 'LoginMiddlewareNotSignedIn'
  | 'LoginMiddlewareUnverified'
  | `${RateLimitMetrics}GatewayRateLimitHit`;

// Combine all the metrics above together into a type
export type Metrics =
  | `${ConditionalMetrics}::${'Success' | 'Failure'}`
  | UnconditionalMetrics;

// type safe helper method for consent page tracking
export const consentsPageMetric = (
  page: string,
  getOrPost: 'Get' | 'Post',
  type: 'Success' | 'Failure',
): Metrics => `${getOrPost}ConsentsPage-${page}::${type}`;

// type safe helper method for email sending metrics
export const emailSendMetric = (
  email: EmailMetrics,
  type: 'Success' | 'Failure',
): Metrics => `${email}EmailSend::${type}`;

export const rateLimitHitMetric = (bucketType: RateLimitMetrics): Metrics =>
  `${bucketType}GatewayRateLimitHit`;
