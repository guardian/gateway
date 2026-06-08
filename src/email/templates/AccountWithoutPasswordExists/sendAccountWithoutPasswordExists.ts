import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedAccountWithoutPasswordExists } from '../renderedTemplates';
import { TrackingQueryParams } from '@/shared/model/QueryParams';

type Props = {
	to: string;
	subject?: string;
	activationToken: string;
} & TrackingQueryParams;

export const sendAccountWithoutPasswordExistsEmail = async ({
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
	const renderedEmail = await renderedAccountWithoutPasswordExists;

	return send({
		html: renderedEmail.html.replace('$createPasswordLink', setPasswordUrl),
		plainText: renderedEmail.plain.replace(
			'$createPasswordLink',
			setPasswordUrl,
		),
		subject,
		to,
	});
};
