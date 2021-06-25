type Props = {
  name?: string;
};

export const ExampleText = ({ name = '' }: Props) => `
Hello ${name},
You’ve requested a link to sign in to your account.
Please use the link below to sign in.

https://profile.theguardian.com


If you prefer you can create a password using the following link.

https://profile.theguardian.com

The Guardian

If you have any queries about this email please contact our customer services team at userhelp@theguardian.com

Your Data: To find out what personal data we collect and how we use it, please visit our privacy policy at https://www.theguardian.com/help/privacy-policy

Terms & Conditions: By registering with theguardian.com you agreed to abide by our terms of service, as described at https://www.theguardian.com/help/terms-of-service

Guardian News and Media Limited, Kings Place, 90 York Way, London, N1 9GU, United Kingdom
`;
