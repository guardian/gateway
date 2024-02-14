import { SUPPORT_EMAIL } from '@/shared/model/Configuration';

export const CompleteRegistrationText = () => `
Welcome to the Guardian,

Please click below to complete your registration.

This link is valid for 60 minutes.

$activateLink

The Guardian

If you received this email by mistake, please delete it. Your registration won't be complete if you don't click the link above.

If you have any queries about this email please contact our customer services team at ${SUPPORT_EMAIL}

Guardian News and Media Limited, Kings Place, 90 York Way, London, N1 9GU, United Kingdom
`;
