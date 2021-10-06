import { render } from 'mjml-react';
import { send } from '@/email/lib/send';
import { getProfileUrl } from '@/server/lib/getProfileUrl';

import { NoAccount } from './NoAccount';
import { NoAccountText } from './NoAccountText';

type Props = {
  to: string;
  subject?: string;
};

const plainText = NoAccountText();
const { html } = render(
  NoAccount({
    profileUrl: getProfileUrl(),
  }),
);

export const sendNoAccountEmail = ({
  to,
  subject = 'Your attempt to sign up to theguardian.com',
}: Props) => {
  return send({
    html,
    plainText,
    subject,
    to,
  });
};
