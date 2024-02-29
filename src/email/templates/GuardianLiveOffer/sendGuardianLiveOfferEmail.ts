import { render } from '@faire/mjml-react/utils/render';
import { send } from '@/email/lib/send';

import { GuardianLiveOffer } from './GuardianLiveOffer';
import { GuardianLiveOfferText } from './GuardianLiveOfferText';

type Props = {
	to: string;
	subject?: string;
};

const plainText = GuardianLiveOfferText();
const { html } = render(GuardianLiveOffer());

export const sendAccidentalEmail = ({
	to,
	subject = 'Your Guardian account and discount code',
}: Props) => {
	return send({
		html,
		plainText,
		subject,
		to,
	});
};
