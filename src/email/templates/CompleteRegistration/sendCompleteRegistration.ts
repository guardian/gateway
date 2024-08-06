import { generateUrl } from '@/email/lib/generateUrl';
import { send } from '@/email/lib/send';
import type { TrackingQueryParams } from '@/shared/model/QueryParams';
import { renderedCompleteRegistration } from '../renderedTemplates';

type Props = {
	to: string;
	subject?: string;
	activationToken: string;
} & TrackingQueryParams;

export const sendCompleteRegistration = ({
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
	return send({
		html: renderedCompleteRegistration.html.replace(
			'$activateLink',
			activateUrl,
		),
		plainText: renderedCompleteRegistration.plain.replace(
			'$activateLink',
			activateUrl,
		),
		subject,
		to,
	});
};
