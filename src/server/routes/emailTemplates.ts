import { Request, Router } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';

import {
  renderedResetPasswordEmail,
  renderedVerifyEmail,
  renderedAccidentalEmail,
} from '@/email/templates/renderedTemplates';

const router = Router();

const emailTemplateTypes = [
  'reset-password',
  'verify',
  'accidental-email',
] as const;
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
      return renderedResetPasswordEmail;
    case 'verify':
      return renderedVerifyEmail;
    case 'accidental-email':
      return renderedAccidentalEmail;
    default:
      // We don't want to do anything for invalid template names
      return undefined;
  }
};

/* GET a valid email template name.
 * Returns a JSON object with the fields 'plain' and 'html' which contain the
 * plain-text and HTML versions of the requested email template.
 * Returns 404 for invalid template names. */
router.get(
  '/email/:template',
  (req: Request, res: ResponseWithRequestState) => {
    const template = req.params.template as EmailTemplateType;
    const templateIsValid = emailTemplateTypes.includes(template);

    return templateIsValid
      ? res.json(renderEmailTemplate(template))
      : res.sendStatus(404);
  },
);

export default router;
