import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedAccountExists } from '../renderedTemplates';

type Props = {
  to: string;
  subject?: string;
  activationToken?: string;
};

export const sendAccountExistsEmail = ({
  to,
  subject = 'Nearly there...',
  activationToken,
}: Props) => {
  // If we have a token, the URL should be /reset-password/:token. If we don't,
  // we send them to /reset-password instead, without a token.
  const resetPasswordUrl = generateUrl({
    path: 'reset-password',
    token: activationToken,
  });
  const signInUrl = generateUrl({
    path: 'signin',
  });
  return send({
    html: renderedAccountExists.html
      .replace('$passwordResetLink', resetPasswordUrl)
      .replace('$signInLink', signInUrl),
    plainText: renderedAccountExists.plain
      .replace('$passwordResetLink', resetPasswordUrl)
      .replace('$signInLink', signInUrl),
    subject,
    to,
  });
};
