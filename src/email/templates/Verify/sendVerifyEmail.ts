import { render } from 'mjml-react';
import { send } from '@/email/lib/send';

import { Verify } from './Verify';
import { VerifyText } from './VerifyText';

type Props = {
  to: string;
  subject?: string;
};

const plainText = VerifyText();
const { html } = render(Verify());

export const sendVerifyEmail = ({
  to,
  subject = 'Please complete your registration',
}: Props) => {
  return send({
    html,
    plainText,
    subject,
    to,
  });
};
