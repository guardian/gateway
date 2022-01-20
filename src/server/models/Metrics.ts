// This file defines the metrics that we would like to track in cloudwatch

// Specific emails to track
type EmailMetrics =
  | 'AccountExists'
  | 'AccountExistsWithoutPassword'
  | 'AccountVerification'
  | 'CreatePassword'
  | 'ResetPassword';

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
  | 'OktaSetPasswordOnWelcomePage'
  | 'OktaWelcomeResendEmail'
  | 'Register'
  | 'SendMagicLink'
  | 'SendValidationEmail'
  | 'SignIn'
  | 'UpdatePassword'
  | 'RecaptchaMiddleware';

// Unconditional metrics that we want to track directly
type UnconditionalMetrics =
  | 'LoginMiddlewareNotRecent'
  | 'LoginMiddlewareNotSignedIn'
  | 'LoginMiddlewareUnverified';

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
