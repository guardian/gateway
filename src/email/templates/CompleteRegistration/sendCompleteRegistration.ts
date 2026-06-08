import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedCompleteRegistration } from '../renderedTemplates';
import { TrackingQueryParams } from '@/shared/model/QueryParams';

type Props = {
	to: string;
	subject?: string;
	activationToken: string;
} & TrackingQueryParams;

export const sendCompleteRegistration = async ({
	to,
	subject = 'Complete your Guardian account',
	activationToken,
	ref,
	refViewId,
}: Props) => {
	const activateUrl = generateUrl({
		path: 'welcome',
		token: activationToken,
		ref,
		refViewId,
	});
	const renderedEmail = await renderedCompleteRegistration;
	return send({
		html: renderedEmail.html.replace('$activateLink', activateUrl),
		plainText: renderedEmail.plain.replace('$activateLink', activateUrl),
		subject,
		to,
	});
};
