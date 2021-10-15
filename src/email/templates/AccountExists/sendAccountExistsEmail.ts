import { render } from 'mjml-react';
import { send } from '@/email/lib/send';
import { getProfileUrl } from '@/server/lib/getProfileUrl';

import { AccountExists } from './AccountExists';
import { AccountExistsText } from './AccountExistsText';

type Props = {
  to: string;
  subject?: string;
};

const profileUrl = getProfileUrl();

const plainText = AccountExistsText({ profileUrl });

const { html } = render(
  AccountExists({
    profileUrl,
  }),
);

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
