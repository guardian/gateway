import { Request, Router } from 'express';
import { Routes } from '@/shared/model/Routes';
import { renderer } from '@/server/lib/renderer';
import { logger } from '@/server/lib/logger';
import {
  validate as validateToken,
  change as changePassword,
} from '@/server/lib/idapi/changePassword';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import { ResponseWithRequestState } from '@/server/models/Express';
import { trackMetric } from '@/server/lib/AWS';
import { Metrics } from '@/server/models/Metrics';
import { removeNoCache } from '@/server/lib/middleware/cache';
import { PageTitle } from '@/shared/model/PageTitle';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import {
  PasswordValidationResult,
  validatePasswordLength,
} from '@/shared/lib/PasswordValidation';
import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';

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
  } else if (
    password &&
    validatePasswordLength(password) !== PasswordValidationResult.VALID_PASSWORD
  ) {
    errors.push({
      field: 'password',
      message: ChangePasswordErrors.PASSWORD_LENGTH,
    });
  }

  if (!passwordConfirm) {
    errors.push({
      field: 'password_confirm',
      message: ChangePasswordErrors.REPEAT_PASSWORD_BLANK,
    });
  } else if (
    validatePasswordLength(passwordConfirm) !==
    PasswordValidationResult.VALID_PASSWORD
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
  async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;
    const { token } = req.params;

    state = {
      ...state,
      pageData: {
        ...state.pageData,
        browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
      },
    };

    try {
      state = {
        ...state,
        pageData: {
          ...state.pageData,
          email: await validateToken(token, req.ip),
        },
      };
    } catch (error) {
      logger.error(error);
      return res.type('html').send(
        renderer(Routes.RESET_RESEND, {
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
  },
);

router.post(
  `${Routes.CHANGE_PASSWORD}${Routes.CHANGE_PASSWORD_TOKEN}`,
  async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    const { token } = req.params;

    const { password, password_confirm: passwordConfirm } = req.body;

    state = {
      ...state,
      pageData: {
        browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
      },
    };

    try {
      const fieldErrors = validatePasswordChangeFields(
        password,
        passwordConfirm,
      );

      if (fieldErrors.length) {
        state = {
          ...state,
          pageData: {
            ...state.pageData,
            email: await validateToken(token, req.ip),
            fieldErrors,
          },
        };
        const html = renderer(`${Routes.CHANGE_PASSWORD}/${token}`, {
          requestState: state,
          pageTitle: PageTitle.CHANGE_PASSWORD,
        });
        return res.status(422).type('html').send(html);
      }

      if (password !== passwordConfirm) {
        throw { message: ChangePasswordErrors.PASSWORD_NO_MATCH, status: 422 };
      }

      const cookies = await changePassword(password, token, req.ip);

      setIDAPICookies(res, cookies);
    } catch (error) {
      const { message, status } = error;
      logger.error(error);

      trackMetric(Metrics.CHANGE_PASSWORD_FAILURE);

      state = {
        ...state,
        globalMessage: {
          ...state.globalMessage,
          error: message,
        },
      };

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
  },
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
  Routes.RESET_RESEND,
  removeNoCache,
  (_: Request, res: ResponseWithRequestState) => {
    const html = renderer(Routes.RESET_RESEND, {
      pageTitle: PageTitle.RESET_RESEND,
      requestState: res.locals,
    });
    res.type('html').send(html);
  },
);

export default router;
