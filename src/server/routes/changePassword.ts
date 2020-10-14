import { Request, Router } from 'express';
import { Routes } from '@/shared/model/Routes';
import { renderer } from '@/server/lib/renderer';
import { logger } from '@/server/lib/logger';
import { GlobalState } from '@/shared/model/GlobalState';
import {
  validate as validateToken,
  change as changePassword,
} from '@/server/lib/idapi/changePassword';
import { ResponseWithLocals } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/AWS';
import { Metrics } from '@/server/models/Metrics';
import { removeNoCache } from '@/server/lib/middleware/cache';
import { PageTitle } from '@/shared/model/PageTitle';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { passwordValidation } from '@/client/components/PasswordValidation';

const router = Router();

export interface FieldError {
  field: string;
  message: string;
}

const validatePasswordChangeFields = (
  password: string,
  passwordConfirm: string,
): Array<FieldError> => {
  const validationResult = passwordValidation(password, passwordConfirm);
  if (validationResult.failedMessage) {
    return [
      {
        field: 'password',
        message: validationResult.failedMessage,
      },
    ];
  }

  return [];
};

router.get(
  `${Routes.CHANGE_PASSWORD}${Routes.CHANGE_PASSWORD_TOKEN}`,
  async (req: Request, res: ResponseWithLocals) => {
    const { token } = req.params;
    const state: GlobalState = {};

    try {
      const email = await validateToken(token, req.ip);

      state.email = email;
    } catch (error) {
      logger.error(error);
      return res.type('html').send(
        renderer(Routes.RESET_RESEND, {
          globalState: state,
          queryParams: res.locals.queryParams,
          pageTitle: PageTitle.RESET_RESEND,
        }),
      );
    }

    const html = renderer(`${Routes.CHANGE_PASSWORD}/${token}`, {
      globalState: state,
      queryParams: res.locals.queryParams,
      pageTitle: PageTitle.CHANGE_PASSWORD,
    });
    return res.type('html').send(html);
  },
);

router.post(
  `${Routes.CHANGE_PASSWORD}${Routes.CHANGE_PASSWORD_TOKEN}`,
  async (req: Request, res: ResponseWithLocals) => {
    const state: GlobalState = {};

    const { token } = req.params;

    const { password, password_confirm: passwordConfirm } = req.body;

    try {
      const fieldErrors = validatePasswordChangeFields(
        password,
        passwordConfirm,
      );

      if (fieldErrors.length) {
        state.fieldErrors = fieldErrors;
        const html = renderer(`${Routes.CHANGE_PASSWORD}/${token}`, {
          globalState: state,
          queryParams: res.locals.queryParams,
          pageTitle: PageTitle.CHANGE_PASSWORD,
        });
        return res.status(422).type('html').send(html);
      }

      const cookies = await changePassword(password, token, req.ip);

      setIDAPICookies(res, cookies);
    } catch (error) {
      const { message, status } = error;
      logger.error(error);

      trackMetric(Metrics.CHANGE_PASSWORD_FAILURE);

      state.error = message;
      const html = renderer(`${Routes.CHANGE_PASSWORD}/${token}`, {
        globalState: state,
        queryParams: res.locals.queryParams,
        pageTitle: PageTitle.CHANGE_PASSWORD,
      });
      return res.status(status).type('html').send(html);
    }

    trackMetric(Metrics.CHANGE_PASSWORD_SUCCESS);

    const html = renderer(Routes.CHANGE_PASSWORD_COMPLETE, {
      globalState: state,
      queryParams: res.locals.queryParams,
      pageTitle: PageTitle.CHANGE_PASSWORD_COMPLETE,
    });

    return res.type('html').send(html);
  },
);

router.get(
  Routes.CHANGE_PASSWORD_COMPLETE,
  (_: Request, res: ResponseWithLocals) => {
    const html = renderer(Routes.CHANGE_PASSWORD_COMPLETE, {
      queryParams: res.locals.queryParams,
      pageTitle: PageTitle.CHANGE_PASSWORD_COMPLETE,
    });
    return res.type('html').send(html);
  },
);

router.get(
  Routes.RESET_RESEND,
  removeNoCache,
  (_: Request, res: ResponseWithLocals) => {
    const html = renderer(Routes.RESET_RESEND);
    res.type('html').send(html);
  },
);

export default router;
