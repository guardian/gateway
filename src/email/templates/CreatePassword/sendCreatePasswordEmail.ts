import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedCreatePassword } from '../renderedTemplates';

type Props = {
  to: string;
  subject?: string;
  setPasswordToken: string;
};

export const sendCreatePasswordEmail = ({
  to,
  subject = 'Nearly there...',
  setPasswordToken,
}: Props) => {
  const setPasswordUrl = generateUrl({
    path: 'set-password',
    token: setPasswordToken,
  });

  return send({
    html: renderedCreatePassword.html.replace(
      '$createPasswordLink',
      setPasswordUrl,
    ),
    plainText: renderedCreatePassword.plain.replace(
      '$createPasswordLink',
      setPasswordUrl,
    ),
    subject,
    to,
  });
};
