import { render } from 'mjml-react';
import { send } from '@/email/lib/send';

import { AccountExists } from './AccountExists';
import { AccountExistsText } from './AccountExistsText';

type Props = {
  to: string;
  subject?: string;
};

const plainText = AccountExistsText();

const { html } = render(AccountExists());

export const sendAccountExistsEmail = ({
  to,
  subject = 'Nearly there...',
}: Props) => {
  return send({
    html,
    plainText,
    subject,
    to,
  });
};
