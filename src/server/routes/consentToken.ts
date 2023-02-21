import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { renderer } from '@/server/lib/renderer';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import {
  validateConsentToken,
  resendConsentEmail,
} from '@/server/lib/idapi/consentToken';
import { mergeRequestState } from '@/server/lib/requestState';
import { logger } from '@/server/lib/serverSideLogger';

// This route is of this specific form because it's a direct copy of the legacy
// route in identity-frontend, and emails sent by IDAPI contain this URL.
// We can change the route after we've migrated the emails from IDAPI.
router.get(
  '/consent-token/:token/accept',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const ip = req.ip;
    const sc_gu_u = req.cookies.SC_GU_U;
    const token = req.params.token;
    try {
      await validateConsentToken(ip, sc_gu_u, token, res.locals.requestId);
      // Redirect to /consents/thank-you (a page managed by Frontend). This is
      // to retain the legacy behaviour of the route from identity-frontend.
      return res.redirect(303, '/consents/thank-you');
    } catch (error) {
      // On an error we assume the token is invalid and render a page
      // where the user can request a new consent email.
      const html = renderer('/consent-token/error', {
        pageTitle: 'Resend Consent Email',
        requestState: mergeRequestState(res.locals, {
          pageData: {
            token,
          },
        }),
      });
      return res.type('html').status(200).send(html);
    }
  }),
);

router.get(
  '/consent-token/email-sent',
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer('/consent-token/email-sent', {
      pageTitle: 'Check Your Inbox',
      requestState: res.locals,
    });
    return res.type('html').status(200).send(html);
  },
);

router.post(
  '/consent-token/resend',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    // This is a pass-through route to IDAPI, which will send a new consent
    // email to the user if the token matches. We don't need to do anything
    // with the response here.
    const { token } = req.body;
    const ip = req.ip;
    const sc_gu_u = req.cookies.SC_GU_U;
    try {
      await resendConsentEmail(ip, sc_gu_u, token, res.locals.requestId);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} Error`, error, {
        request_id: res.locals.requestId,
      });
    } finally {
      return res.redirect(303, '/consent-token/email-sent');
    }
  }),
);

export default router.router;
