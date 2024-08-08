import { render } from '@faire/mjml-react/utils/render';
import { send } from '@/email/lib/send';

import { EmailChallengePasscode } from './EmailChallengePasscode';
import { EmailChallengePasscodeText } from './EmailChallengePasscodeText';

type Props = {
	to: string;
	subject?: string;
};

const plainText = EmailChallengePasscodeText();
const { html } = render(EmailChallengePasscode({}));

export const sendEmailChallengePasscodeEmail = ({
	to,
	subject = 'Your one-time passcode',
}: Props) => {
	return send({
		html,
		plainText,
		subject,
		to,
	});
};
