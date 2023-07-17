import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedUnvalidatedEmailResetPassword } from '../renderedTemplates';

type Props = {
	to: string;
	subject?: string;
	resetPasswordToken: string;
};

export const sendUnvalidatedEmailResetPasswordEmail = ({
	to,
	subject = 'Reset your theguardian.com password',
	resetPasswordToken,
}: Props) => {
	const resetPasswordUrl = generateUrl({
		path: 'reset-password',
		token: resetPasswordToken,
	});
	return send({
		html: renderedUnvalidatedEmailResetPassword.html.replace(
			'$passwordResetLink',
			resetPasswordUrl,
		),
		plainText: renderedUnvalidatedEmailResetPassword.plain.replace(
			'$passwordResetLink',
			resetPasswordUrl,
		),
		subject,
		to,
	});
};
