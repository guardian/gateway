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

export const renderedAccidentalEmail: EmailRenderResult = {
	plain: AccidentalEmailText(),
	html: render(AccidentalEmail()).html,
};

export const renderedAccountExists: EmailRenderResult = {
	plain: AccountExistsText(),
	html: render(AccountExists()).html,
};

export const renderedAccountWithoutPasswordExists: EmailRenderResult = {
	plain: AccountWithoutPasswordExistsText(),
	html: render(AccountWithoutPasswordExists()).html,
};

export const renderedCreatePassword: EmailRenderResult = {
	plain: CreatePasswordText(),
	html: render(CreatePassword()).html,
};

export const renderedNoAccount: EmailRenderResult = {
	plain: NoAccountText(),
	html: render(NoAccount()).html,
};

export const renderedResetPassword: EmailRenderResult = {
	plain: ResetPasswordText(),
	html: render(ResetPassword()).html,
};

export const renderedUnvalidatedEmailResetPassword: EmailRenderResult = {
	plain: UnvalidatedEmailResetPasswordText(),
	html: render(UnvalidatedEmailResetPassword()).html,
};

export const renderedCompleteRegistration: EmailRenderResult = {
	plain: CompleteRegistrationText(),
	html: render(CompleteRegistration()).html,
};

export const renderedRegistrationPasscode: EmailRenderResult = {
	plain: RegistrationPasscodeText(),
	html: render(RegistrationPasscode({})).html,
};

export const renderedEmailChallengePasscode: EmailRenderResult = {
	plain: EmailChallengePasscodeText(),
	html: render(EmailChallengePasscode({})).html,
};
