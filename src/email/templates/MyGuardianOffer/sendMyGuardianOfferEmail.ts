import { render } from '@faire/mjml-react/utils/render';
import { send } from '@/email/lib/send';

import { MyGuardianOffer } from './MyGuardianOffer';
import { MyGuardianOfferText } from './MyGuardianOfferText';

type Props = {
	to: string;
	subject?: string;
};

const plainText = MyGuardianOfferText();
const { html } = render(MyGuardianOffer());

export const sendMyGuardianOfferEmail = ({
	to,
	subject = 'Access to My Guardian',
}: Props) => {
	return send({
		html,
		plainText,
		subject,
		to,
	});
};
