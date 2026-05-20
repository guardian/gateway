import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedUnvalidatedEmailResetPassword } from '../renderedTemplates';
import { TrackingQueryParams } from '@/shared/model/QueryParams';

type Props = {
	to: string;
	subject?: string;
	resetPasswordToken: string;
} & TrackingQueryParams;

export const sendUnvalidatedEmailResetPasswordEmail = async ({
	to,
	subject = 'Reset your theguardian.com password',
	resetPasswordToken,
	ref,
	refViewId,
}: Props) => {
	const resetPasswordUrl = generateUrl({
		path: 'reset-password',
		token: resetPasswordToken,
		ref,
		refViewId,
	});

	const renderedEmail = await renderedUnvalidatedEmailResetPassword;

	return send({
		html: renderedEmail.html.replace('$passwordResetLink', resetPasswordUrl),
		plainText: renderedEmail.plain.replace(
			'$passwordResetLink',
			resetPasswordUrl,
		),
		subject,
		to,
	});
};
