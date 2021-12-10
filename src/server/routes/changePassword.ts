import { Request } from 'express';
import deepmerge from 'deepmerge';

import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordTokenController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { typedRouter as router } from '@/server/lib/typedRoutes';

router.get(
  '/reset-password/:token',
  checkPasswordTokenController('/reset-password', 'Change Password'),
);

router.post(
  '/reset-password/:token',
  setPasswordTokenController('/reset-password', 'Change Password', (res) =>
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
      pageTitle: 'Password Changed',
    });
    return res.type('html').send(html);
  },
);

router.get(
  '/reset-password/resend',
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer('/reset-password/resend', {
      pageTitle: 'Resend Change Password Email',
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

router.get('/reset/expired', (_: Request, res: ResponseWithRequestState) => {
  const html = renderer('/reset/expired', {
    pageTitle: 'Resend Change Password Email',
    requestState: res.locals,
  });
  res.type('html').send(html);
});

export default router.router;
