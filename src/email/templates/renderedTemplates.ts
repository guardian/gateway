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
import { Verify } from './Verify/Verify';
import { VerifyText } from './Verify/VerifyText';

import { render as mjmlRender } from 'mjml-react';

type EmailRenderResult = {
  plain: string;
  html: string;
};

// The minify option is deprecated in mjml-react's minification library, so we
// turn off minification here. Cf: https://github.com/wix-incubator/mjml-react/issues/58
const render = (input: JSX.Element) => mjmlRender(input, { minify: false });

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

export const renderedVerify = {
  plain: VerifyText(),
  html: render(Verify()).html,
} as EmailRenderResult;
