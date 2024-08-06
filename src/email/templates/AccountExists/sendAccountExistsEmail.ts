import { generateUrl } from '@/email/lib/generateUrl';
import { send } from '@/email/lib/send';
import type { TrackingQueryParams } from '@/shared/model/QueryParams';
import { renderedAccountExists } from '../renderedTemplates';

type Props = {
	to: string;
	subject?: string;
	activationToken?: string;
} & TrackingQueryParams;

export const sendAccountExistsEmail = ({
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
	return send({
		html: renderedAccountExists.html
			.replace('$passwordResetLink', resetPasswordUrl)
			.replace('$signInLink', signInUrl),
		plainText: renderedAccountExists.plain
			.replace('$passwordResetLink', resetPasswordUrl)
			.replace('$signInLink', signInUrl),
		subject,
		to,
	});
};
