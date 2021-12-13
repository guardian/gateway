import { Request } from 'express';
import deepmerge from 'deepmerge';

import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { typedRouter as router } from '@/server/lib/typedRoutes';

router.get(
  '/reset-password/complete',
  (req: Request, res: ResponseWithRequestState) => {
    const email = readEmailCookie(req);

    const html = renderer('/reset-password/complete', {
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

router.get(
  '/reset-password/expired',
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer('/reset-password/expired', {
      pageTitle: 'Resend Change Password Email',
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

// The below route must be defined below the other GET /reset-password/* routes otherwise the other routes will fail
router.get(
  '/reset-password/:token',
  checkPasswordTokenController('/reset-password', 'Change Password'),
);

router.post(
  '/reset-password/:token',
  setPasswordController(
    '/reset-password',
    'Change Password',
    '/reset-password/complete',
  ),
);

export default router.router;
