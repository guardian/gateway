import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedAccountWithoutPasswordExists } from '../renderedTemplates';
import { TrackingQueryParams } from '@/shared/model/QueryParams';

type Props = {
	to: string;
	subject?: string;
	activationToken: string;
} & TrackingQueryParams;

export const sendAccountWithoutPasswordExistsEmail = ({
	to,
	subject = 'Nearly there...',
	activationToken,
	ref,
	refViewId,
}: Props) => {
	const setPasswordUrl = generateUrl({
		path: 'set-password',
		token: activationToken,
		ref,
		refViewId,
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
