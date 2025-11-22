import { send } from '@/email/lib/send';
import { TrackingQueryParams } from '@/shared/model/QueryParams';
import { renderedPrintPromoSignUp } from '../renderedTemplates';

type Props = {
	to: string;
	subject?: string;
} & TrackingQueryParams;

export const sendPrintPromoSignUpEmail = async ({
	to,
	subject = 'Welcome to Print Promo Sign Up',
}: Props) => {
	// Email sending logic here

	return send({
		html: renderedPrintPromoSignUp.html,
		plainText: renderedPrintPromoSignUp.plain,
		subject,
		to,
	});
};
