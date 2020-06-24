import { Request, Router } from 'express';
import { Routes } from '@/shared/model/Routes';
import { renderer } from '@/server/lib/renderer';
import { logger } from '@/server/lib/logger';
import { GlobalState } from '@/shared/model/GlobalState';
import {
  validate as validateToken,
  change as changePassword,
} from '@/server/lib/idapi/changePassword';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import { getConfiguration } from '@/server/lib/configuration';
import { ResponseWithLocals } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/AWS';
import { Metrics } from '@/server/models/Metrics';
import { removeNoCache } from '@/server/lib/middleware/cache';

const { baseUri } = getConfiguration();

const router = Router();

export interface FieldError {
  field: string;
  message: string;
}

const validatePasswordChangeFields = (
  password: string,
  passwordConfirm: string,
): Array<FieldError> => {
  const errors: Array<FieldError> = [];
  if (!password) {
    errors.push({
      field: 'password',
      message: ChangePasswordErrors.PASSWORD_BLANK,
    });
  }

  if (!passwordConfirm) {
    errors.push({
      field: 'password_confirm',
      message: ChangePasswordErrors.REPEAT_PASSWORD_BLANK,
    });
  }

  if (password && (password.length < 6 || password.length > 72)) {
    errors.push({
      field: 'password',
      message: ChangePasswordErrors.PASSWORD_LENGTH,
    });
  }

  if (
    passwordConfirm &&
    (passwordConfirm.length < 6 || passwordConfirm.length > 72)
  ) {
    errors.push({
      field: 'password_confirm',
      message: ChangePasswordErrors.PASSWORD_LENGTH,
    });
  }

  return errors;
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
        }),
      );
    }

    const html = renderer(`${Routes.CHANGE_PASSWORD}/${token}`, {
      globalState: state,
      queryParams: res.locals.queryParams,
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
        });
        return res.type('html').send(html);
      }

      if (password !== passwordConfirm) {
        throw ChangePasswordErrors.PASSWORD_NO_MATCH;
      }

      const {
        values: cookieValues,
        expiresAt: cookieExpiry,
      } = await changePassword(password, token, req.ip);

      cookieValues.forEach(
        ({
          key,
          value,
          sessionCookie = false,
        }: {
          key: string;
          value: string;
          sessionCookie: boolean;
        }) => {
          res.cookie(key, value, {
            // base uri in format profile.theguardian.com, whereas we want cookie domain theguardian.com
            // so replace profile. string in baseUri with empty string, rather than having to set another variable
            domain: `${baseUri.replace('profile.', '')}`,
            expires: sessionCookie ? undefined : new Date(cookieExpiry),
            httpOnly: key !== 'GU_U', // unless GU_U cookie, set to true
            secure: key !== 'GU_U', // unless GU_U cookie, set to true
            sameSite: 'strict',
          });
        },
      );
    } catch (error) {
      logger.error(error);

      trackMetric(Metrics.CHANGE_PASSWORD_FAILURE);

      state.error = error;
      const html = renderer(`${Routes.CHANGE_PASSWORD}/${token}`, {
        globalState: state,
        queryParams: res.locals.queryParams,
      });
      return res.type('html').send(html);
    }

    trackMetric(Metrics.CHANGE_PASSWORD_SUCCESS);

    const html = renderer(Routes.CHANGE_PASSWORD_COMPLETE, {
      globalState: state,
      queryParams: res.locals.queryParams,
    });

    return res.type('html').send(html);
  },
);

router.get(
  Routes.CHANGE_PASSWORD_COMPLETE,
  (_: Request, res: ResponseWithLocals) => {
    const html = renderer(Routes.CHANGE_PASSWORD_COMPLETE, {
      queryParams: res.locals.queryParams,
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
