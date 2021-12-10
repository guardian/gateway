import { Request } from 'express';
import deepmerge from 'deepmerge';

import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { PageTitle } from '@/shared/model/PageTitle';
import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordTokenController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { typedRouter as router } from '@/server/lib/typedRoutes';

router.get(
  '/reset-password/:token',
  checkPasswordTokenController(
    '/reset-password',
    PageTitle.CHANGE_PASSWORD,
    '/reset',
    PageTitle.RESET_RESEND,
  ),
);

router.post(
  '/reset-password/:token',
  setPasswordTokenController(
    '/reset-password',
    PageTitle.CHANGE_PASSWORD,
    '/reset',
    PageTitle.RESET_RESEND,
    (res) =>
      res.redirect(
        303,
        addQueryParamsToPath(
          '/password/reset-confirmation',
          res.locals.queryParams,
        ),
      ),
  ),
);

router.get(
  '/password/reset-confirmation',
  (req: Request, res: ResponseWithRequestState) => {
    const email = readEmailCookie(req);

    const html = renderer('/password/reset-confirmation', {
      requestState: deepmerge(res.locals, {
        pageData: {
          email,
        },
      }),
      pageTitle: PageTitle.CHANGE_PASSWORD_COMPLETE,
    });
    return res.type('html').send(html);
  },
);

router.get('/reset/resend', (_: Request, res: ResponseWithRequestState) => {
  const html = renderer('/reset/resend', {
    pageTitle: PageTitle.RESET_RESEND,
    requestState: res.locals,
  });
  res.type('html').send(html);
});

router.get('/reset/expired', (_: Request, res: ResponseWithRequestState) => {
  const html = renderer('/reset/expired', {
    pageTitle: PageTitle.RESET_RESEND,
    requestState: res.locals,
  });
  res.type('html').send(html);
});

export default router.router;
