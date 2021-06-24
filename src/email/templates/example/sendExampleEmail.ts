import { render } from 'mjml-react';
import { send } from '@/email/lib/send';

import { Example } from './Example';
import { ExampleText } from './ExampleText';

type Props = {
  to: string;
  subject?: string;
  name?: string;
};

export const sendExampleEmail = ({
  name,
  to,
  subject = 'Default subject text',
}: Props) => {
  const email = Example({ name });
  const plainText = ExampleText({ name });
  const { html } = render(email);

  return send({ html, plainText, subject, to });
};
