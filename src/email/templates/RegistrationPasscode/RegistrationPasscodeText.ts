import { SUPPORT_EMAIL } from '@/shared/model/Configuration';

export const RegistrationPasscodeText = () => `
Thank you for creating an account with the Guardian. Use the following code to verify your email.

\${oneTimePassword}

Do not share this code with anyone. This code will expire in 30 minutes.

If your code has expired, create your Guardian account again.

If you received this email by mistake, please delete it. You won't be registered if you don't do anything.

If you have any queries about why you are receiving this email, please contact our customer service team at ${SUPPORT_EMAIL}

Guardian News and Media Limited, Kings Place, 90 York Way, London, N1 9GU, United Kingdom
`;
