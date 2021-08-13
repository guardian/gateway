import { Request, Router } from 'express';
import deepmerge from 'deepmerge';
import { ResponseWithRequestState } from '@/server/models/Express';
import { Routes } from '@/shared/model/Routes';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/logger';
import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';
import {
  validate as validateToken,
  change as changePassword,
} from '@/server/lib/idapi/changePassword';
import { renderer } from '@/server/lib/renderer';
import { PageTitle } from '@/shared/model/PageTitle';
import { FieldError } from '@/shared/model/ClientState';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { addReturnUrlToPath } from '@/server/lib/queryParams';
import { consentPages } from '@/server/routes/consents';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { resendAccountVerificationEmail } from '@/server/lib/idapi/user';

const router = Router();

const { baseUri } = getConfiguration();

const validatePasswordField = (password: string): Array<FieldError> => {
  const errors: Array<FieldError> = [];

  if (!password) {
    errors.push({
      field: 'password',
      message: ChangePasswordErrors.PASSWORD_BLANK,
    });
  } else if (password.length < 8 || password.length > 72) {
    errors.push({
      field: 'password',
      message: ChangePasswordErrors.PASSWORD_LENGTH,
    });
  }

  return errors;
};

// resend account verification page
router.get(
  `${Routes.WELCOME}${Routes.RESEND}`,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(`${Routes.WELCOME}${Routes.RESEND}`, {
      pageTitle: PageTitle.WELCOME_RESEND,
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

// POST form handler to resend account verification email
router.post(
  `${Routes.WELCOME}${Routes.RESEND}`,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { email } = req.body;
    const { returnUrl } = res.locals.queryParams;

    try {
      await resendAccountVerificationEmail(email, req.ip, returnUrl);

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

      return res.redirect(303, Routes.WELCOME_SENT);
    } catch (error) {
      const { message, status } = error;
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      const html = renderer(`${Routes.WELCOME}${Routes.RESEND}`, {
        pageTitle: PageTitle.WELCOME_RESEND,
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
  Routes.WELCOME_SENT,
  (req: Request, res: ResponseWithRequestState) => {
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
        previousPage: `${Routes.WELCOME}${Routes.RESEND}`,
      },
    });

    const html = renderer(Routes.WELCOME_SENT, {
      pageTitle: PageTitle.EMAIL_SENT,
      requestState: state,
    });
    res.type('html').send(html);
  },
);

// welcome page, check token and display set password page
router.get(
  `${Routes.WELCOME}${Routes.TOKEN_PARAM}`,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;
    const { token } = req.params;

    try {
      state = deepmerge(state, {
        pageData: {
          browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
          email: await validateToken(token, req.ip),
        },
      });

      const html = renderer(`${Routes.WELCOME}/${token}`, {
        requestState: state,
        pageTitle: PageTitle.WELCOME,
      });
      return res.type('html').send(html);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      return res.redirect(`${Routes.WELCOME}${Routes.RESEND}`);
    }
  }),
);

// POST form handler to set password on welcome page
router.post(
  `${Routes.WELCOME}${Routes.TOKEN_PARAM}`,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { token } = req.params;
    const { password } = req.body;

    state = deepmerge(state, {
      pageData: {
        browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
      },
    });

    try {
      const fieldErrors = validatePasswordField(password);

      if (fieldErrors.length) {
        state = deepmerge(state, {
          pageData: {
            email: await validateToken(token, req.ip),
            fieldErrors,
          },
        });
        const html = renderer(`${Routes.CHANGE_PASSWORD}/${token}`, {
          requestState: state,
          pageTitle: PageTitle.CHANGE_PASSWORD,
        });
        return res.status(422).type('html').send(html);
      }

      const cookies = await changePassword(password, token, req.ip);

      setIDAPICookies(res, cookies);

      trackMetric(Metrics.ACCOUNT_VERIFICATION_SUCCESS);

      return res.redirect(
        303,
        addReturnUrlToPath(
          `${Routes.CONSENTS}/${consentPages[0].page}`,
          state.queryParams.returnUrl,
        ),
      );
    } catch (error) {
      const { message, status } = error;
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      trackMetric(Metrics.ACCOUNT_VERIFICATION_FAILURE);

      const html = renderer(`${Routes.WELCOME}/${token}`, {
        requestState: deepmerge(state, {
          globalMessage: {
            error: message,
          },
        }),
        pageTitle: PageTitle.WELCOME,
      });
      return res.status(status).type('html').send(html);
    }
  }),
);

export default router;
