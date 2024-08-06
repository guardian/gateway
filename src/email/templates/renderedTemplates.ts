import { render } from '@faire/mjml-react/utils/render';
import { AccidentalEmail } from './AccidentalEmail/AccidentalEmail';
import { AccidentalEmailText } from './AccidentalEmail/AccidentalEmailText';
import { AccountExists } from './AccountExists/AccountExists';
import { AccountExistsText } from './AccountExists/AccountExistsText';
import { AccountWithoutPasswordExists } from './AccountWithoutPasswordExists/AccountWithoutPasswordExists';
import { AccountWithoutPasswordExistsText } from './AccountWithoutPasswordExists/AccountWithoutPasswordExistsText';
import { CompleteRegistration } from './CompleteRegistration/CompleteRegistration';
import { CompleteRegistrationText } from './CompleteRegistration/CompleteRegistrationText';
import { CreatePassword } from './CreatePassword/CreatePassword';
import { CreatePasswordText } from './CreatePassword/CreatePasswordText';
import { NoAccount } from './NoAccount/NoAccount';
import { NoAccountText } from './NoAccount/NoAccountText';
import { RegistrationPasscode } from './RegistrationPasscode/RegistrationPasscode';
import { RegistrationPasscodeText } from './RegistrationPasscode/RegistrationPasscodeText';
import { ResetPassword } from './ResetPassword/ResetPassword';
import { ResetPasswordText } from './ResetPassword/ResetPasswordText';
import { UnvalidatedEmailResetPassword } from './UnvalidatedEmailResetPassword/UnvalidatedEmailResetPassword';
import { UnvalidatedEmailResetPasswordText } from './UnvalidatedEmailResetPassword/UnvalidatedEmailResetPasswordText';

type EmailRenderResult = {
	plain: string;
	html: string;
};

export const renderedAccidentalEmail = {
	plain: AccidentalEmailText(),
	html: render(AccidentalEmail()).html,
} as EmailRenderResult;

export const renderedAccountExists = {
	plain: AccountExistsText(),
	html: render(AccountExists()).html,
} as EmailRenderResult;

export const renderedAccountWithoutPasswordExists = {
	plain: AccountWithoutPasswordExistsText(),
	html: render(AccountWithoutPasswordExists()).html,
} as EmailRenderResult;

export const renderedCreatePassword = {
	plain: CreatePasswordText(),
	html: render(CreatePassword()).html,
} as EmailRenderResult;

export const renderedNoAccount = {
	plain: NoAccountText(),
	html: render(NoAccount()).html,
} as EmailRenderResult;

export const renderedResetPassword = {
	plain: ResetPasswordText(),
	html: render(ResetPassword()).html,
} as EmailRenderResult;

export const renderedUnvalidatedEmailResetPassword = {
	plain: UnvalidatedEmailResetPasswordText(),
	html: render(UnvalidatedEmailResetPassword()).html,
} as EmailRenderResult;

export const renderedCompleteRegistration = {
	plain: CompleteRegistrationText(),
	html: render(CompleteRegistration()).html,
} as EmailRenderResult;

export const renderedRegistrationPasscode = {
	plain: RegistrationPasscodeText(),
	html: render(RegistrationPasscode({})).html,
} as EmailRenderResult;
