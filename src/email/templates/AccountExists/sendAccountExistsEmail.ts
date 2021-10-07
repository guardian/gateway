import { render } from 'mjml-react';
import { send } from '@/email/lib/send';
import { getProfileUrl } from '@/server/lib/getProfileUrl';

import { AccountExists } from './AccountExists';
import { AccountExistsText } from './AccountExistsText';

type Props = {
  to: string;
  token: string;
  subject?: string;
};

const plainText = AccountExistsText();
const { html } = render(
  AccountExists({
    profileUrl: getProfileUrl(),
  }),
);

export const sendAccountExistsEmail = ({
  token,
  to,
  subject = 'Your attempt to sign up to theguardian.com',
}: Props) => {
  return send({
    html: html.replace('TOKEN_PLACEHOLDER', token),
    plainText: plainText.replace('TOKEN_PLACEHOLDER', token),
    subject,
    to,
  });
};
