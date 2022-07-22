import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedAccountWithoutPasswordExists } from '../renderedTemplates';

type Props = {
  to: string;
  subject?: string;
  activationToken: string;
};

export const sendAccountWithoutPasswordExistsEmail = ({
  to,
  subject = 'Nearly there...',
  activationToken,
}: Props) => {
  const setPasswordUrl = generateUrl({
    path: 'set-password',
    token: activationToken,
  });

  return send({
    html: renderedAccountWithoutPasswordExists.html.replace(
      '$createPasswordLink',
      setPasswordUrl,
    ),
    plainText: renderedAccountWithoutPasswordExists.plain.replace(
      '$createPasswordLink',
      setPasswordUrl,
    ),
    subject,
    to,
  });
};
