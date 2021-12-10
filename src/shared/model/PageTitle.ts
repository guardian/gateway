/**
 * PageTitle is used by the renderer to populate the <title> tag in the HTML page <head>
 */
export type PageTitle =
  | 'Not Found'
  | 'Unexpected Error'
  | 'Register'
  | 'Reset Password'
  | 'Sign in'
  | 'Check Your Inbox'
  | 'Resend Reset Password'
  | 'Create Password'
  | 'Password Set'
  | 'Resend Set Password'
  | 'Change Password'
  | 'Password Changed'
  | 'Verify Email'
  | 'Welcome'
  | 'Resend Welcome Email'
  | 'Onboarding'
  | 'Your data'
  | 'Stay in touch'
  | 'Newsletters'
  | 'Review';

export const PageTitle = (title: PageTitle) => {
  return title;
};
