import { typedRouter as router } from '@/server/lib/typedRoutes';
import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { setEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { sendCreatePasswordEmail } from '@/server/lib/idapi/user';
import { logger } from '@/server/lib/serverSideLogger';
import handleRecaptcha from '@/server/lib/recaptcha';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { EmailType } from '@/shared/model/EmailType';
import { ResetPasswordErrors } from '@/shared/model/Errors';
import deepmerge from 'deepmerge';
import { Request } from 'express';
import { ApiError } from '../models/Error';
import { buildUrl } from '@/shared/lib/routeUtils';

// set password complete page
router.get(
  '/set-password/complete',
  (req: Request, res: ResponseWithRequestState) => {
    const email = readEmailCookie(req);

    const html = renderer('/set-password/complete', {
      requestState: deepmerge(res.locals, {
        pageData: {
          email,
        },
      }),
      pageTitle: 'Password Set',
    });
    return res.type('html').send(html);
  },
);

// resend "create (set) password" email page
router.get(
  '/set-password/resend',
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer('/set-password/resend', {
      pageTitle: 'Resend Create Password Email',
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

// set password page session expired
router.get(
  '/set-password/expired',
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer('/set-password/expired', {
      pageTitle: 'Resend Create Password Email',
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

// POST handler for resending "create (set) password" email
router.post(
  '/set-password/resend',
  handleRecaptcha,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { email } = req.body;
    const state = res.locals;
    const { returnUrl, emailSentSuccess, ref, refViewId } = state.queryParams;

    try {
      await sendCreatePasswordEmail(
        email,
        req.ip,
        returnUrl,
        ref,
        refViewId,
        state.ophanConfig,
      );

      setEncryptedStateCookie(res, {
        email,
        emailType: EmailType.CREATE_PASSWORD,
      });

      return res.redirect(
        303,
        addQueryParamsToPath(
          '/set-password/email-sent',
          res.locals.queryParams,
          {
            emailSentSuccess,
          },
        ),
      );
    } catch (error) {
      const { message, status } =
        error instanceof ApiError
          ? error
          : new ApiError({ message: ResetPasswordErrors.GENERIC });

      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      const html = renderer('/set-password/resend', {
        pageTitle: 'Resend Create Password Email',
        requestState: deepmerge(res.locals, {
          globalMessage: {
            error: message,
          },
        }),
      });
      return res.status(status).type('html').send(html);
    }
  }),
);

// email sent page
router.get(
  '/set-password/email-sent',
  (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const email = readEmailCookie(req);

    state = deepmerge(state, {
      pageData: {
        email,
        previousPage: buildUrl('/set-password/resend'),
      },
    });

    const html = renderer('/set-password/email-sent', {
      pageTitle: 'Check Your Inbox',
      requestState: state,
    });
    res.type('html').send(html);
  },
);

// set password page with token check
// The below route must be defined below the other GET /set-password/* routes otherwise the other routes will fail
router.get(
  '/set-password/:token',
  checkPasswordTokenController('/set-password', 'Create Password'),
);

// POST handler for set password page to set password
router.post(
  '/set-password/:token',
  setPasswordController(
    '/set-password',
    'Create Password',
    '/set-password/complete',
  ),
);

export default router.router;
