import { SUPPORT_EMAIL } from '@/shared/model/Configuration';

export const EmailChallengePasscodeText = () => `
Your one-time passcode

This passcode can only be used once. Do not share this code with anyone. This code will expire in 30 minutes.

\${oneTimePassword}

If your code has expired, please request a new code.

If you did not request this code, you can safely disregard this email.

If you have any queries about why you are receiving this email, please contact our customer service team at ${SUPPORT_EMAIL}

Guardian News and Media Limited, Kings Place, 90 York Way, London, N1 9GU, United Kingdom
`;
