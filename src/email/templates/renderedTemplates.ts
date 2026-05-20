import { AccidentalEmail } from './AccidentalEmail/AccidentalEmail';
import { AccidentalEmailText } from './AccidentalEmail/AccidentalEmailText';
import { AccountExists } from './AccountExists/AccountExists';
import { AccountExistsText } from './AccountExists/AccountExistsText';
import { AccountWithoutPasswordExists } from './AccountWithoutPasswordExists/AccountWithoutPasswordExists';
import { AccountWithoutPasswordExistsText } from './AccountWithoutPasswordExists/AccountWithoutPasswordExistsText';
import { CreatePassword } from './CreatePassword/CreatePassword';
import { CreatePasswordText } from './CreatePassword/CreatePasswordText';
import { NoAccount } from './NoAccount/NoAccount';
import { NoAccountText } from './NoAccount/NoAccountText';
import { ResetPassword } from './ResetPassword/ResetPassword';
import { ResetPasswordText } from './ResetPassword/ResetPasswordText';
import { UnvalidatedEmailResetPassword } from './UnvalidatedEmailResetPassword/UnvalidatedEmailResetPassword';
import { UnvalidatedEmailResetPasswordText } from './UnvalidatedEmailResetPassword/UnvalidatedEmailResetPasswordText';
import { CompleteRegistration } from './CompleteRegistration/CompleteRegistration';
import { CompleteRegistrationText } from './CompleteRegistration/CompleteRegistrationText';

import { render } from '@faire/mjml-react/utils/render';
import { RegistrationPasscode } from './RegistrationPasscode/RegistrationPasscode';
import { RegistrationPasscodeText } from './RegistrationPasscode/RegistrationPasscodeText';
import { EmailChallengePasscodeText } from './EmailChallengePasscode/EmailChallengePasscodeText';
import { EmailChallengePasscode } from './EmailChallengePasscode/EmailChallengePasscode';

type EmailRenderResult = {
	plain: string;
	html: string;
};

export const renderedAccidentalEmail: Promise<EmailRenderResult> =
	(async () => {
		return {
			plain: AccidentalEmailText(),
			html: (await render(AccidentalEmail())).html,
		};
	})();

export const renderedAccountExists: Promise<EmailRenderResult> = (async () => {
	return {
		plain: AccountExistsText(),
		html: (await render(AccountExists())).html,
	};
})();

export const renderedAccountWithoutPasswordExists: Promise<EmailRenderResult> =
	(async () => {
		return {
			plain: AccountWithoutPasswordExistsText(),
			html: (await render(AccountWithoutPasswordExists())).html,
		};
	})();

export const renderedCreatePassword: Promise<EmailRenderResult> = (async () => {
	return {
		plain: CreatePasswordText(),
		html: (await render(CreatePassword())).html,
	};
})();

export const renderedNoAccount: Promise<EmailRenderResult> = (async () => {
	return {
		plain: NoAccountText(),
		html: (await render(NoAccount())).html,
	};
})();

export const renderedResetPassword: Promise<EmailRenderResult> = (async () => {
	return {
		plain: ResetPasswordText(),
		html: (await render(ResetPassword())).html,
	};
})();

export const renderedUnvalidatedEmailResetPassword: Promise<EmailRenderResult> =
	(async () => {
		return {
			plain: UnvalidatedEmailResetPasswordText(),
			html: (await render(UnvalidatedEmailResetPassword())).html,
		};
	})();

export const renderedCompleteRegistration: Promise<EmailRenderResult> =
	(async () => {
		return {
			plain: CompleteRegistrationText(),
			html: (await render(CompleteRegistration())).html,
		};
	})();

export const renderedRegistrationPasscode: Promise<EmailRenderResult> =
	(async () => {
		return {
			plain: RegistrationPasscodeText(),
			html: (await render(RegistrationPasscode({}))).html,
		};
	})();

export const renderedEmailChallengePasscode: Promise<EmailRenderResult> =
	(async () => {
		return {
			plain: EmailChallengePasscodeText(),
			html: (await render(EmailChallengePasscode({}))).html,
		};
	})();
