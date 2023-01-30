import { Request, Response } from 'express';

import { buildUrl } from '@/shared/lib/routeUtils';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { logger } from '@/server/lib/serverSideLogger';
import { renderer } from '@/server/lib/renderer';
import { trackMetric } from '@/server/lib/trackMetric';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { ApiError } from '@/server/models/Error';
import handleRecaptcha from '@/server/lib/recaptcha';
import { mergeRequestState } from '@/server/lib/requestState';

router.get('/magic-link', (req: Request, res: Response) => {
  const html = renderer('/magic-link', {
    requestState: res.requestState,
    pageTitle: 'Sign in',
  });
  res.type('html').send(html);
});

router.post(
  '/magic-link',
  handleRecaptcha,
  handleAsyncErrors(async (req: Request, res: Response) => {
    let state = res.requestState;

    const { email = '' } = req.body;

    try {
      logger.info(
        `TODO: Implement the logic to send the magic link to ${email} here.`,
      );
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
        request_id: state.requestId,
      });
      const { message, status } =
        error instanceof ApiError ? error : new ApiError();

      trackMetric('SendMagicLink::Failure');

      state = mergeRequestState(state, {
        pageData: {
          formError: message,
        },
      });

      const html = renderer('/magic-link', {
        requestState: state,
        pageTitle: 'Sign in',
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric('SendMagicLink::Success');

    return res.redirect(303, buildUrl('/magic-link/email-sent'));
  }),
);

router.get('/magic-link/email-sent', (_: Request, res: Response) => {
  const html = renderer('/magic-link/email-sent', {
    pageTitle: 'Sign in',
    requestState: res.requestState,
  });
  res.type('html').send(html);
});

export default router.router;
