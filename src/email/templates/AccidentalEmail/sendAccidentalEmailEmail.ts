// Strange import path: see https://github.com/Faire/mjml-react/issues/64
// TODO: Fix import path if imports are fixed upstream
import { render } from '@faire/mjml-react/dist/src/utils/render';
import { send } from '@/email/lib/send';

import { AccidentalEmail } from './AccidentalEmail';
import { AccidentalEmailText } from './AccidentalEmailText';

type Props = {
  to: string;
  subject?: string;
};

const plainText = AccidentalEmailText();
const { html } = render(AccidentalEmail());

export const sendAccidentalEmail = ({
  to,
  subject = 'Please ignore this email - it has been sent accidentally',
}: Props) => {
  return send({
    html,
    plainText,
    subject,
    to,
  });
};
