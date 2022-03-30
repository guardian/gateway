import { ResetPassword } from './ResetPassword/ResetPassword';
import { ResetPasswordText } from './ResetPassword/ResetPasswordText';
import { Verify } from './Verify/Verify';
import { VerifyText } from './Verify/VerifyText';
import { AccidentalEmail } from './AccidentalEmail/AccidentalEmail';
import { AccidentalEmailText } from './AccidentalEmail/AccidentalEmailText';

import { render } from 'mjml-react';

type EmailRenderResult = {
  plain: string;
  html: string;
};

export const renderedResetPasswordEmail = {
  plain: ResetPasswordText(),
  html: render(ResetPassword()).html,
} as EmailRenderResult;

export const renderedVerifyEmail = {
  plain: VerifyText(),
  html: render(Verify()).html,
} as EmailRenderResult;

export const renderedAccidentalEmail = {
  plain: AccidentalEmailText(),
  html: render(AccidentalEmail()).html,
} as EmailRenderResult;
