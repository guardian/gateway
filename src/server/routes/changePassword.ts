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

const { baseUri } = getConfiguration();

const router = Router();

export interface FieldError {
  field: string;
  message: string;
}

const validatePasswordChangeRequired = (
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
      const fieldErrors = validatePasswordChangeRequired(
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
            domain: `*.${baseUri}`,
            expires: sessionCookie ? undefined : new Date(cookieExpiry),
            httpOnly: key !== 'GU_U', // unless GU_U cookie, set to true
            secure: key !== 'GU_U', // unless GU_U cookie, set to true
            sameSite: 'strict',
          });
        },
      );
    } catch (error) {
      logger.error(error);
      state.error = error;
      const html = renderer(`${Routes.CHANGE_PASSWORD}/${token}`, {
        globalState: state,
        queryParams: res.locals.queryParams,
      });
      return res.type('html').send(html);
    }

    const html = renderer(Routes.CHANGE_PASSWORD_SENT, {
      globalState: state,
      queryParams: res.locals.queryParams,
    });

    return res.type('html').send(html);
  },
);

router.get(
  Routes.CHANGE_PASSWORD_SENT,
  (_: Request, res: ResponseWithLocals) => {
    const html = renderer(Routes.CHANGE_PASSWORD_SENT, {
      queryParams: res.locals.queryParams,
    });
    return res.type('html').send(html);
  },
);

export default router;
