export enum IdapiErrorMessages {
	NOT_FOUND = 'Not found',
	MISSING_FIELD = 'Required field missing',
	INVALID_TOKEN = 'Invalid token',
	ACCESS_DENIED = 'Access Denied',
	INVALID_EMAIL_PASSWORD = 'Invalid email or password',
	EMAIL_IN_USE = 'Email in use',
}

export enum FederationErrors {
	SOCIAL_SIGNIN_BLOCKED = 'accountLinkingRequired',
}

export enum GenericErrors {
	DEFAULT = 'Sorry, something went wrong. Please try again.',
}

export enum ResetPasswordErrors {
	NO_ACCOUNT = 'There is no account for that email address, please check for typos or create an account.',
	NO_EMAIL = 'Email field must not be blank.',
}

export enum SignInErrors {
	GENERIC = 'There was a problem signing in, please try again.',
	AUTHENTICATION_FAILED = "Email and password don't match",
	SOCIAL_SIGNIN_ERROR = 'Social sign-in unsuccessful',
}

export enum RegistrationErrors {
	GENERIC = 'There was a problem registering, please try again.',
	EMAIL_INVALID = 'Please enter a valid email address.',
	PROVISIONING_FAILURE = 'Your account has been created but there was a problem signing you in.',
	PASSCODE_INVALID = 'Incorrect code',
}

// shown at the top of the change password page when something goes wrong
export enum ChangePasswordErrors {
	GENERIC = 'There was a problem changing your password, please try again.',
}

// shown above the password input field when a password is submitted that does not meet our complexity requirements
export enum PasswordFieldErrors {
	AT_LEAST_8 = 'Please make sure your password is at least 8 characters long.',
	MAXIMUM_72 = 'Please make sure your password is not longer than 72 characters.',
	COMMON_PASSWORD = 'Please use a password that is hard to guess.',
	SAME_PASSWORD = 'Please use a password that is different to your current password.',
}

export enum NameFieldErrors {
	INFORMATION_MISSING = 'Some information is missing',
	INFORMATION_MISSING_CONTEXT = 'Please enter your First name and Last name',
}

// shown below the password input field as the user types a password (before they click the submit button)
export enum ShortPasswordFieldErrors {
	AT_LEAST_8 = 'At least 8 characters',
	MAXIMUM_72 = 'Maximum of 72 characters',
	WEAK_PASSWORD = 'Weak password: avoid passwords that are easy to guess',
	STRONG_PASSWORD_REQUIRED = 'Strong password required',
}

export enum NewslettersErrors {
	GENERIC = 'There was a problem displaying newsletter options, please try again.',
}

export enum ConsentsErrors {
	GENERIC = 'There was a problem saving your choice, please try again.',
	USER = 'There was a problem retrieving your details, please try again.',
	ACCESS_DENIED = 'Access Denied',
}

export enum CsrfErrors {
	CSRF_ERROR = 'Sorry, something went wrong. If you made any changes these might have not been saved. Please try again.',
}

export enum CaptchaErrors {
	GENERIC = 'Google reCAPTCHA verification failed.',
}

export enum RateLimitErrors {
	GENERIC = 'Rate limit exceeded. This request has been rate limited, please try again shortly.',
}

export enum UnsubscribeErrors {
	GENERIC = 'There was a problem unsubscribing, please try again.',
}

export enum SubscribeErrors {
	GENERIC = 'There was a problem subscribing, please try again.',
}

export interface StructuredGatewayError {
	message: string;
	severity: 'BAU' | 'UNEXPECTED';
}

export type GatewayError = StructuredGatewayError | string;

// ensures we have a structured error, if the original was a string it applies default values for the rest of the fields
export function asStructuredError(
	error?: GatewayError,
): StructuredGatewayError | undefined {
	if (typeof error === 'string') {
		return {
			message: error,
			severity: 'UNEXPECTED',
		};
	}
	return error;
}

// ensures we get a string error message, if the original was a structured error it throws away the rest of the fields
export function extractMessage(error?: GatewayError): string | undefined {
	if (typeof error === 'string') {
		return error;
	}
	return error?.message;
}
