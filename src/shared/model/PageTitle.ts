/**
 * PageTitle is used by the renderer to populate the <title> tag in the HTML page <head>
 */
export type PageTitle =
	| 'Not Found'
	| 'Unexpected Error'
	| 'Register'
	| 'Register With Email'
	| 'Reset Password'
	| 'Sign in'
	| 'Signed in'
	| 'Check Your Inbox'
	| 'Create Password'
	| 'Resend Create Password Email'
	| 'Password Set'
	| 'Change Password'
	| 'Resend Change Password Email'
	| 'Password Changed'
	| 'Resend Consent Email'
	| 'Verify Email'
	| 'Welcome'
	| 'Resend Welcome Email'
	| 'Onboarding'
	| 'Your data'
	| 'Stay in touch'
	| 'Newsletters'
	| 'Review'
	| 'Maintenance'
	| 'Jobs'
	| 'Change Email'
	| 'Subscribe Error'
	| 'Subscribe Confirmation'
	| 'Unsubscribe Error'
	| 'Unsubscribe Confirmation'
	| 'Account Deletion'
	| 'Account Deletion Complete'
	| 'Account Deletion Blocked'
	| 'Choose Newsletters';

export type PasswordPageTitle = Extract<
	'Welcome' | 'Create Password' | 'Change Password',
	PageTitle
>;

export const PageTitle = (title: PageTitle) => {
	return title;
};
