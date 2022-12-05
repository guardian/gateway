// Strange import path: see https://github.com/Faire/mjml-react/issues/64
// TODO: Fix import path if imports are fixed upstream
import { render } from '@faire/mjml-react/dist/src/utils/render';
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
