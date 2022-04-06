import { render } from 'mjml-react';
import { send } from '@/email/lib/send';

import { NoAccount } from './NoAccount';
import { NoAccountText } from './NoAccountText';

type Props = {
  to: string;
  subject?: string;
};

const plainText = NoAccountText();
const { html } = render(NoAccount());

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
