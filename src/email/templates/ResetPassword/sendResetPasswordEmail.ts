import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedResetPassword } from '../renderedTemplates';
import { TrackingQueryParams } from '@/shared/model/QueryParams';

type Props = {
	to: string;
	subject?: string;
	resetPasswordToken: string;
} & TrackingQueryParams;

export const sendResetPasswordEmail = async ({
	to,
	subject = 'Reset your password',
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
	const renderedEmail = await renderedResetPassword;
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
