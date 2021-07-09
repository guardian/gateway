import { Routes } from '@/shared/model/Routes';

export const AccountExistsText = () => `
Hello again,

You are already registered with the Guardian.

You can use this link to sign in.

https://profile.theguardian.com${Routes.SIGN_IN}

If you forgot your password, you can click below to reset it.

https://profile.theguardian.com${Routes.RESET}

The Guardian

If you have any queries about this email please contact our customer services team at userhelp@theguardian.com

Your Data: To find out what personal data we collect and how we use it, please visit our privacy policy at https://www.theguardian.com/help/privacy-policy

Terms & Conditions: By registering with theguardian.com you agreed to abide by our terms of service, as described at https://www.theguardian.com/help/terms-of-service

Guardian News and Media Limited, Kings Place, 90 York Way, London, N1 9GU, United Kingdom
`;
