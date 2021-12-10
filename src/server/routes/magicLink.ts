import { Request } from 'express';
import deepmerge from 'deepmerge';

import { buildUrl } from '@/shared/lib/routeUtils';
import { typedRouter as router } from '@/server/lib/typedRoutes';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { trackMetric } from '@/server/lib/trackMetric';
import { ResponseWithRequestState } from '@/server/models/Express';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { ApiError } from '@/server/models/Error';
import handleRecaptcha from '@/server/lib/recaptcha';

router.get('/magic-link', (req: Request, res: ResponseWithRequestState) => {
  const html = renderer('/magic-link', {
    requestState: res.locals,
    pageTitle: 'Sign in',
  });
  res.type('html').send(html);
});

router.post(
  '/magic-link',
  handleRecaptcha,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { email = '' } = req.body;

    try {
      console.log(
        `TODO: Implement the logic to send the magic link to ${email} here`,
      );
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      const { message, status } =
        error instanceof ApiError ? error : new ApiError();

      trackMetric('SendMagicLink::Failure');

      state = deepmerge(state, {
        globalMessage: {
          error: message,
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

router.get(
  '/magic-link/email-sent',
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer('/magic-link/email-sent', {
      pageTitle: 'Sign in',
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

export default router.router;
