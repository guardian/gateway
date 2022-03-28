import { Request, Router } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { render } from 'mjml-react';

import { ResetPassword } from '../../email/templates/ResetPassword/ResetPassword';
import { ResetPasswordText } from '../../email/templates/ResetPassword/ResetPasswordText';
import { Verify } from '../../email/templates/Verify/Verify';
import { VerifyText } from '../../email/templates/Verify/VerifyText';

const router = Router();

const emailTemplateTypes = ['ResetPassword', 'Verify'] as const;
type EMAIL_TEMPLATE_TYPE = typeof emailTemplateTypes[number];

type EMAIL_RENDER_RESULT = {
  plain: string;
  html: string;
};

const renderEmailTemplate = (template: EMAIL_TEMPLATE_TYPE) => {
  switch (template) {
    case 'ResetPassword':
      return {
        plain: ResetPasswordText(),
        html: render(ResetPassword()).html,
      } as EMAIL_RENDER_RESULT;
    case 'Verify':
      return {
        plain: VerifyText(),
        html: render(Verify()).html,
      } as EMAIL_RENDER_RESULT;
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
    const template = req.params.template as EMAIL_TEMPLATE_TYPE;
    const templateIsValid = emailTemplateTypes.includes(template);

    return templateIsValid
      ? res.json(renderEmailTemplate(template))
      : res.send(406); // 406: Not Acceptable
  },
);

export default router;
