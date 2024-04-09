import { render } from '@faire/mjml-react/utils/render';
import { send } from '@/email/lib/send';

import { RegistrationPasscode } from './RegistrationPasscode';
import { RegistrationPasscodeText } from './RegistrationPasscodeText';

type Props = {
	to: string;
	subject?: string;
};

const plainText = RegistrationPasscodeText();
const { html } = render(RegistrationPasscode());

export const sendRegistrationPasscodeEmail = ({
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
