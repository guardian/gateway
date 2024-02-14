import { SUPPORT_EMAIL } from '@/shared/model/Configuration';

export const ResetPasswordText = () => `
Hello,

You’ve asked us to send you a link to reset your password.

This link is valid for 60 minutes.

$passwordResetLink

The Guardian

If you didn’t request to reset your password, please ignore this email. Your details won’t be changed and no one has accessed your account.

If you have any queries about why you are receiving this email, please contact our customer service team at ${SUPPORT_EMAIL}

Guardian News and Media Limited, Kings Place, 90 York Way London N1 9GU, United Kingdom
`;
