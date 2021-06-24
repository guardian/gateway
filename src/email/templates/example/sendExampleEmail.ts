import { render } from 'mjml-react';
import { send } from '@/email/lib/send';

import { Example } from './Example';
import { ExampleText } from './ExampleText';

type Props = {
  to: string;
  subject: string;
  name?: string;
};

export const sendExampleEmail = ({ name, to, subject }: Props) => {
  const email = Example({ name });
  const plainText = ExampleText({ name });
  const { html } = render(email);

  try {
    send({ html, plainText, subject, to });
  } catch (error) {
    // TODO: Handle errors
  }
};
