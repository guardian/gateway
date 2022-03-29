import { Request, Router } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { render } from 'mjml-react';

import { ResetPassword } from '../../email/templates/ResetPassword/ResetPassword';
import { ResetPasswordText } from '../../email/templates/ResetPassword/ResetPasswordText';
import { Verify } from '../../email/templates/Verify/Verify';
import { VerifyText } from '../../email/templates/Verify/VerifyText';

const router = Router();

const emailTemplateTypes = ['reset-password', 'verify'] as const;
type EmailTemplateType = typeof emailTemplateTypes[number];

type EmailRenderResult = {
  plain: string;
  html: string;
};

const renderEmailTemplate = (
  template: EmailTemplateType,
): EmailRenderResult | undefined => {
  switch (template) {
    case 'reset-password':
      return {
        plain: ResetPasswordText(),
        html: render(ResetPassword()).html,
      } as EmailRenderResult;
    case 'verify':
      return {
        plain: VerifyText(),
        html: render(Verify()).html,
      } as EmailRenderResult;
    default:
      // We don't want to do anything for invalid template names
      return undefined;
  }
};

/* GET a valid email template name.
 * Returns 406 for invalid template names. */
router.get(
  '/email/:template',
  (req: Request, res: ResponseWithRequestState) => {
    const template = req.params.template as EmailTemplateType;
    const templateIsValid = emailTemplateTypes.includes(template);

    return templateIsValid
      ? res.json(renderEmailTemplate(template))
      : res.send(406); // 406: Not Acceptable
  },
);

export default router;
