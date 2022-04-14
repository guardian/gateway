import { Request } from 'express';
import deepmerge from 'deepmerge';

import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import handleRecaptcha from '@/server/lib/recaptcha';
import { sendChangePasswordEmailController } from '@/server/controllers/sendChangePasswordEmail';

// reset password email form
router.get('/reset-password', (req: Request, res: ResponseWithRequestState) => {
  const html = renderer('/reset-password', {
    pageTitle: 'Reset Password',
    requestState: deepmerge(res.locals, {
      pageData: {
        email: readEmailCookie(req),
      },
    }),
  });
  res.type('html').send(html);
});

// send reset password email
router.post(
  '/reset-password',
  handleRecaptcha,
  sendChangePasswordEmailController(),
);

// reset password email sent page
router.get(
  '/reset-password/email-sent',
  (req: Request, res: ResponseWithRequestState) => {
    const html = renderer('/reset-password/email-sent', {
      pageTitle: 'Check Your Inbox',
      requestState: deepmerge(res.locals, {
        pageData: {
          email: readEmailCookie(req),
          previousPage: '/reset-password',
        },
      }),
    });
    res.type('html').send(html);
  },
);

// password updated confirmation page
router.get(
  '/reset-password/complete',
  (req: Request, res: ResponseWithRequestState) => {
    const html = renderer('/reset-password/complete', {
      requestState: deepmerge(res.locals, {
        pageData: {
          email: readEmailCookie(req),
        },
      }),
      pageTitle: 'Password Changed',
    });
    return res.type('html').send(html);
  },
);

// link expired page
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

// session timed out page
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

// IMPORTANT: The /reset-password/:token routes must be defined below the other routes.
// If not, the other routes will fail as the router will try and read the second part
// of the path as the token parameter.

// reset password form
router.get(
  '/reset-password/:token',
  checkPasswordTokenController('/reset-password', 'Change Password'),
);

// update password
router.post(
  '/reset-password/:token',
  setPasswordController(
    '/reset-password',
    'Change Password',
    '/reset-password/complete',
  ),
);

export default router.router;
