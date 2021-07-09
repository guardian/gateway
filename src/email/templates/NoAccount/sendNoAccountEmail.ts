import { render } from 'mjml-react';
import { send } from '@/email/lib/send';

import { NoAccount } from './NoAccount';
import { NoAccountText } from './NoAccountText';

type Props = {
  to: string;
  token: string;
  subject?: string;
};

const plainText = NoAccountText();
const { html } = render(NoAccount());

export const sendNoAccountEmail = ({
  to,
  token,
  subject = 'Your attempt to sign up to theguardian.com',
}: Props) => {
  return send({
    html: html.replace('TOKEN_PLACEHOLDER', token),
    plainText: plainText.replace('TOKEN_PLACEHOLDER', token),
    subject,
    to,
  });
};
