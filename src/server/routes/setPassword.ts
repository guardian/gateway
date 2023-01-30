import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { setPasswordController } from '@/server/controllers/changePassword';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { setEncryptedStateCookie } from '@/server/lib/encryptedStateCookie';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { sendCreatePasswordEmail } from '@/server/lib/idapi/user';
import { logger } from '@/server/lib/serverSideLogger';
import handleRecaptcha from '@/server/lib/recaptcha';
import { renderer } from '@/server/lib/renderer';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { EmailType } from '@/shared/model/EmailType';
import { ResetPasswordErrors } from '@/shared/model/Errors';
import { Request, Response } from 'express';
import { ApiError } from '@/server/models/Error';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { sendEmailInOkta as sendResetPasswordEmailInOktaController } from '@/server/controllers/sendChangePasswordEmail';
import { mergeRequestState } from '@/server/lib/requestState';

const { okta } = getConfiguration();

// set password complete page
router.get('/set-password/complete', (req: Request, res: Response) => {
  const email = readEmailCookie(req);

  const html = renderer('/set-password/complete', {
    requestState: mergeRequestState(res.requestState, {
      pageData: {
        email,
      },
    }),
    pageTitle: 'Password Set',
  });
  return res.type('html').send(html);
});

// resend "create (set) password" email page
router.get('/set-password/resend', (_: Request, res: Response) => {
  const html = renderer('/set-password/resend', {
    pageTitle: 'Resend Create Password Email',
    requestState: res.requestState,
  });
  res.type('html').send(html);
});

// set password page session expired
router.get('/set-password/expired', (_: Request, res: Response) => {
  const html = renderer('/set-password/expired', {
    pageTitle: 'Resend Create Password Email',
    requestState: res.requestState,
  });
  res.type('html').send(html);
});

// POST handler for resending "create (set) password" email
router.post(
  '/set-password/resend',
  handleRecaptcha,
  handleAsyncErrors(async (req: Request, res: Response) => {
    const { useIdapi } = res.requestState.queryParams;
    if (okta.enabled && !useIdapi) {
      return await sendResetPasswordEmailInOktaController(req, res);
    } else {
      const { email } = req.body;
      const state = res.requestState;
      const { emailSentSuccess } = state.queryParams;

      try {
        await sendCreatePasswordEmail(
          email,
          req.ip,
          state.queryParams,
          state.ophanConfig,
          state.requestId,
        );

        setEncryptedStateCookie(res, {
          email,
          emailType: EmailType.CREATE_PASSWORD,
        });

        return res.redirect(
          303,
          addQueryParamsToPath(
            '/set-password/email-sent',
            res.requestState.queryParams,
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

        logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
          request_id: state.requestId,
        });

        const html = renderer('/set-password/resend', {
          pageTitle: 'Resend Create Password Email',
          requestState: mergeRequestState(res.requestState, {
            pageData: {
              formError: message,
            },
          }),
        });
        return res.status(status).type('html').send(html);
      }
    }
  }),
);

// email sent page
router.get('/set-password/email-sent', (req: Request, res: Response) => {
  let state = res.requestState;

  const email = readEmailCookie(req);

  state = mergeRequestState(state, {
    pageData: {
      email,
      resendEmailAction: '/set-password/resend',
      changeEmailPage: '/set-password/resend',
    },
  });

  const html = renderer('/set-password/email-sent', {
    pageTitle: 'Check Your Inbox',
    requestState: state,
  });
  res.type('html').send(html);
});

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
