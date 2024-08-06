import { generateUrl } from '@/email/lib/generateUrl';
import { send } from '@/email/lib/send';
import type { TrackingQueryParams } from '@/shared/model/QueryParams';
import { renderedUnvalidatedEmailResetPassword } from '../renderedTemplates';

type Props = {
	to: string;
	subject?: string;
	resetPasswordToken: string;
} & TrackingQueryParams;

export const sendUnvalidatedEmailResetPasswordEmail = ({
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
