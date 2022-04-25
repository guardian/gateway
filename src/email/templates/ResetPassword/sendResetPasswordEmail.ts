import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedResetPassword } from '../renderedTemplates';

type Props = {
  to: string;
  subject?: string;
  resetPasswordToken: string;
};

export const sendResetPasswordEmail = ({
  to,
  subject = 'Reset your theguardian.com password',
  resetPasswordToken,
}: Props) => {
  const resetPasswordUrl = generateUrl({
    path: 'reset-password',
    token: resetPasswordToken,
  });
  console.log('Sending email with link:', resetPasswordUrl);
  return send({
    html: renderedResetPassword.html.replace(
      '$passwordResetLink',
      resetPasswordUrl,
    ),
    plainText: renderedResetPassword.plain.replace(
      '$passwordResetLink',
      resetPasswordUrl,
    ),
    subject,
    to,
  });
};
