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
  | 'Create Password'
  | 'Resend Create Password Email'
  | 'Password Set'
  | 'Change Password'
  | 'Resend Change Password Email'
  | 'Password Changed'
  | 'Verify Email'
  | 'Welcome'
  | 'Resend Welcome Email'
  | 'Onboarding'
  | 'Your data'
  | 'Stay in touch'
  | 'Newsletters'
  | 'Review'
  | 'Maintenance';

export type PasswordPageTitle = Extract<
  'Welcome' | 'Create Password' | 'Change Password',
  PageTitle
>;

export const PageTitle = (title: PageTitle) => {
  return title;
};
