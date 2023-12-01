import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedCompleteRegistration } from '../renderedTemplates';

type Props = {
	to: string;
	subject?: string;
	activationToken: string;
};

export const sendCompleteRegistration = ({
	to,
	subject = 'Complete your Guardian account',
	activationToken,
}: Props) => {
	const activateUrl = generateUrl({
		path: 'welcome',
		token: activationToken,
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
