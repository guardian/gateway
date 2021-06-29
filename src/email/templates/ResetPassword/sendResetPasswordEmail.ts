import { render } from 'mjml-react';
import { send } from '@/email/lib/send';

import { ResetPassword } from './ResetPassword';
import { ResetPasswordText } from './ResetPasswordText';

type Props = {
  to: string;
  token: string;
  subject?: string;
};

export const sendResetPasswordEmail = ({
  token,
  to,
  subject = 'Reset your theguardian.com password',
}: Props) => {
  const email = ResetPassword({ token });
  const plainText = ResetPasswordText({ token });
  const { html } = render(email);

  return send({ html, plainText, subject, to });
};
