import { Request, Router } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { render } from 'mjml-react';

import { ResetPassword } from '../../email/templates/ResetPassword/ResetPassword';
import { ResetPasswordText } from '../../email/templates/ResetPassword/ResetPasswordText';
import { Verify } from '../../email/templates/Verify/Verify';
import { VerifyText } from '../../email/templates/Verify/VerifyText';

const router = Router();

/* GET a valid email template name. Set the query paramater ?plain=true to
 * receive the email template as plain text. Returns 404 for invalid template
 * names. */
router.get(
  '/email/:template',
  (req: Request, res: ResponseWithRequestState) => {
    const template = req.params.template;
    const renderAsPlainText = !!req.query.plain;
    let plainText, html;
    switch (template) {
      case 'ResetPassword':
        plainText = ResetPasswordText();
        ({ html } = render(ResetPassword()));
        break;
      case 'Verify':
        plainText = VerifyText();
        ({ html } = render(Verify()));
        break;
      default:
        // We don't want to do anything for invalid template names
        return res.sendStatus(404);
    }

    return renderAsPlainText
      ? res.send(plainText)
      : res.type('html').send(html);
  },
);

export default router;
