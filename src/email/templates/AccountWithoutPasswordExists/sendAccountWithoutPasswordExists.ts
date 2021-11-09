import { render } from 'mjml-react';
import { send } from '@/email/lib/send';

import { AccountWithoutPasswordExists } from './AccountWithoutPasswordExists';
import { AccountWithoutPasswordExistsText } from './AccountWithoutPasswordExistsText';

type Props = {
  to: string;
  subject?: string;
};

const plainText = AccountWithoutPasswordExistsText();

const { html } = render(AccountWithoutPasswordExists());

export const sendAccountWithoutPasswordExistsEmail = ({
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
