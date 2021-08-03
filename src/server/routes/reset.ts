import { Request, Router } from 'express';
import deepmerge from 'deepmerge';
import { getToken } from '@/server/lib/idapi/resetPassword';
import { getType } from '@/server/lib/idapi/user';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { Routes } from '@/shared/model/Routes';
import { getEmailFromPlaySessionCookie } from '@/server/lib/playSessionCookie';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { PageTitle } from '@/shared/model/PageTitle';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { sendResetPasswordEmail, sendNoAccountEmail } from '@/email';
import { getConfiguration } from '@/server/lib/getConfiguration';

const router = Router();
const { baseUri } = getConfiguration();

router.get(Routes.RESET, (req: Request, res: ResponseWithRequestState) => {
  let state = res.locals;
  const emailFromPlaySession = getEmailFromPlaySessionCookie(req);

  if (emailFromPlaySession) {
    state = deepmerge(state, {
      pageData: {
        email: emailFromPlaySession,
      },
    });
  }

  const html = renderer(Routes.RESET, {
    requestState: state,
    pageTitle: PageTitle.RESET,
  });
  res.type('html').send(html);
});

router.post(
  Routes.RESET,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { email = '' } = req.body;

    try {
      const userType = await getType(email, req.ip);

      switch (userType) {
        case 'new': {
          sendNoAccountEmail({ to: email });
          break;
        }
        case 'guest':
        case 'current': {
          const token = await getToken(email, req.ip);
          sendResetPasswordEmail({ token, to: email });
          break;
        }
        default: {
          // This shouldn't happen but these external response types are not typed and
          // could change so we handle this here by triggering a generic error
          throw new Error();
        }
      }

      // We set this cookie so that the subsequent email sent page knows which email address was used
      res.cookie(
        'GU_email',
        Buffer.from(JSON.stringify(email)).toString('base64'),
        // We check if we're running locally here to make testing easier
        {
          httpOnly: !baseUri.includes('localhost'),
          secure: !baseUri.includes('localhost'),
          signed: !baseUri.includes('localhost'),
          sameSite: 'strict',
        },
      );
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      const { message, status } = error;

      trackMetric(Metrics.SEND_PASSWORD_RESET_FAILURE);

      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
      });

      const html = renderer(Routes.RESET, {
        requestState: state,
        pageTitle: PageTitle.RESET,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.SEND_PASSWORD_RESET_SUCCESS);

    return res.redirect(303, Routes.RESET_SENT);
  }),
);

router.get(Routes.RESET_SENT, (req: Request, res: ResponseWithRequestState) => {
  let state = res.locals;

  // Read the users email from the GU_email cookie that was set when they posted the previous page
  const emailCookie = baseUri.includes('localhost')
    ? req.cookies['GU_email']
    : req.signedCookies['GU_email'];

  let email;
  try {
    email = JSON.parse(Buffer.from(emailCookie, 'base64').toString('utf-8'));
  } catch (error) {
    email = null;
    logger.error(
      `Error parsing cookie with length ${
        emailCookie ? emailCookie.length : 'undefined'
      }`,
    );
  }

  state = deepmerge(state, {
    pageData: {
      email,
      previousPage: Routes.RESET,
    },
  });

  const html = renderer(Routes.RESET_SENT, {
    pageTitle: PageTitle.RESET_SENT,
    requestState: state,
  });
  res.type('html').send(html);
});

export default router;
