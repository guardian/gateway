import { Routes } from '@/shared/model/Routes';
import { AccountExistsProps } from './AccountExists';

export const AccountExistsText = ({ profileUrl }: AccountExistsProps) => `
Hello again,

You are already registered with the Guardian.

Know your password? Sign in:

${profileUrl}${Routes.SIGN_IN}

If you forgot your password, you can use the link below to reset it.

$passwordResetLink

If you didn’t try to register, please ignore this email. Your details won’t be changed and no one has accessed your account.

If you have any queries about this email please contact our customer service team at userhelp@theguardian.com

Guardian News and Media Limited, Kings Place, 90 York Way, London, N1 9GU, United Kingdom
`;
