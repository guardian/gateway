import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedCreatePassword } from '../renderedTemplates';
import { TrackingQueryParams } from '@/shared/model/QueryParams';

type Props = {
	to: string;
	subject?: string;
	setPasswordToken: string;
} & TrackingQueryParams;

export const sendCreatePasswordEmail = ({
	to,
	subject = 'Nearly there...',
	setPasswordToken,
	ref,
	refViewId,
}: Props) => {
	const setPasswordUrl = generateUrl({
		path: 'set-password',
		token: setPasswordToken,
		ref,
		refViewId,
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
