import { send } from '@/email/lib/send';
import { generateUrl } from '@/email/lib/generateUrl';
import { renderedAccountExists } from '../renderedTemplates';
import { TrackingQueryParams } from '@/shared/model/QueryParams';

type Props = {
	to: string;
	subject?: string;
	activationToken?: string;
} & TrackingQueryParams;

export const sendAccountExistsEmail = async ({
	to,
	subject = 'Nearly there...',
	activationToken,
	ref,
	refViewId,
}: Props) => {
	// If we have a token, the URL should be /reset-password/:token. If we don't,
	// we send them to /reset-password instead, without a token.
	const resetPasswordUrl = generateUrl({
		path: 'reset-password',
		token: activationToken,
		ref,
		refViewId,
	});
	const signInUrl = generateUrl({
		path: 'signin',
		ref,
		refViewId,
	});
	const renderedEmail = await renderedAccountExists;
	return send({
		html: renderedEmail.html
			.replace('$passwordResetLink', resetPasswordUrl)
			.replace('$signInLink', signInUrl),
		plainText: renderedEmail.plain
			.replace('$passwordResetLink', resetPasswordUrl)
			.replace('$signInLink', signInUrl),
		subject,
		to,
	});
};
