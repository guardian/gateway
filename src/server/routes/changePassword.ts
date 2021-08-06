import { Request, Router } from 'express';
import deepmerge from 'deepmerge';
import { Routes } from '@/shared/model/Routes';
import { renderer } from '@/server/lib/renderer';
import { logger } from '@/server/lib/logger';
import {
  validate as validateToken,
  change as changePassword,
} from '@/server/lib/idapi/changePassword';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';
import { PageTitle } from '@/shared/model/PageTitle';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';
import { FieldError } from '@/shared/model/ClientState';

const router = Router();

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

router.get(
  `${Routes.CHANGE_PASSWORD}${Routes.TOKEN_PARAM}`,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;
    const { token } = req.params;

    state = deepmerge(state, {
      pageData: {
        browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
      },
    });

    try {
      state = deepmerge(state, {
        pageData: {
          email: await validateToken(token, req.ip),
        },
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      return res.type('html').send(
        renderer(`${Routes.RESET}${Routes.RESEND}`, {
          requestState: state,
          pageTitle: PageTitle.RESET_RESEND,
        }),
      );
    }

    const html = renderer(`${Routes.CHANGE_PASSWORD}/${token}`, {
      requestState: state,
      pageTitle: PageTitle.CHANGE_PASSWORD,
    });
    return res.type('html').send(html);
  }),
);

router.post(
  `${Routes.CHANGE_PASSWORD}${Routes.TOKEN_PARAM}`,
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
    } catch (error) {
      const { message, status } = error;
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      trackMetric(Metrics.CHANGE_PASSWORD_FAILURE);

      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
      });

      const html = renderer(`${Routes.CHANGE_PASSWORD}/${token}`, {
        requestState: state,
        pageTitle: PageTitle.CHANGE_PASSWORD,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.CHANGE_PASSWORD_SUCCESS);

    const html = renderer(Routes.CHANGE_PASSWORD_COMPLETE, {
      requestState: state,
      pageTitle: PageTitle.CHANGE_PASSWORD_COMPLETE,
    });

    return res.type('html').send(html);
  }),
);

router.get(
  Routes.CHANGE_PASSWORD_COMPLETE,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(Routes.CHANGE_PASSWORD_COMPLETE, {
      requestState: res.locals,
      pageTitle: PageTitle.CHANGE_PASSWORD_COMPLETE,
    });
    return res.type('html').send(html);
  },
);

router.get(
  `${Routes.RESET}${Routes.RESEND}`,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(`${Routes.RESET}${Routes.RESEND}`, {
      pageTitle: PageTitle.RESET_RESEND,
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

export default router;
