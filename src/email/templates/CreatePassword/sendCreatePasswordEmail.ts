import { render } from 'mjml-react';
import { send } from '@/email/lib/send';

import { CreatePassword } from './CreatePassword';
import { CreatePasswordText } from './CreatePasswordText';

type Props = {
  to: string;
  subject?: string;
};

const plainText = CreatePasswordText();
const { html } = render(CreatePassword());

export const sendNoAccountEmail = ({
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
