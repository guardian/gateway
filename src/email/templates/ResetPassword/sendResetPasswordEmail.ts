import { render } from 'mjml-react';
import { send } from '@/email/lib/send';
import { getProfileUrl } from '@/server/lib/getProfileUrl';

import { ResetPassword } from './ResetPassword';
import { ResetPasswordText } from './ResetPasswordText';

type Props = {
  to: string;
  token: string;
  subject?: string;
};

const plainText = ResetPasswordText();
const { html } = render(
  ResetPassword({
    profileUrl: getProfileUrl(),
  }),
);

export const sendResetPasswordEmail = ({
  token,
  to,
  subject = 'Reset your theguardian.com password',
}: Props) => {
  return send({
    html: html.replace('TOKEN_PLACEHOLDER', token),
    plainText: plainText.replace('TOKEN_PLACEHOLDER', token),
    subject,
    to,
  });
};
