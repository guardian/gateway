import { buildUrl } from '@/shared/lib/routeUtils';
import { Routes } from '@/shared/model/Routes';

export const NoAccountText = () => `
Hello,

You are not registered with The Guardian.

It's quick an easy to create an account and we won't ask you for personal details.

Please click below to register.

https://profile.theguardian.com${buildUrl(Routes.REGISTRATION)}

The Guardian

If you have any queries about this email please contact our customer services team at userhelp@theguardian.com

Your Data: To find out what personal data we collect and how we use it, please visit our privacy policy at https://www.theguardian.com/help/privacy-policy

Terms & Conditions: By registering with theguardian.com you agreed to abide by our terms of service, as described at https://www.theguardian.com/help/terms-of-service

Guardian News and Media Limited, Kings Place, 90 York Way, London, N1 9GU, United Kingdom
`;
