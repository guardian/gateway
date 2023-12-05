import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedCompleteRegistration } from '../renderedTemplates';
import { TrackingQueryParams } from '@/shared/model/QueryParams';

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
