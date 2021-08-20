import { Request } from 'express';
import { Routes } from '@/shared/model/Routes';
import deepmerge from 'deepmerge';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import {
  validate as validateToken,
  change as changePassword,
} from '@/server/lib/idapi/changePassword';
import { FieldError } from '@/shared/model/ClientState';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { trackMetric } from '@/server/lib/trackMetric';
import { Metrics } from '@/server/models/Metrics';

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

export const checkResetPasswordTokenController = (
  setPasswordPagePath: string,
  setPasswordPageTitle: string,
  resendEmailPagePath: string,
  resendEmailPageTitle: string,
) =>
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

      const html = renderer(`${setPasswordPagePath}/${token}`, {
        requestState: state,
        pageTitle: setPasswordPageTitle,
      });
      return res.type('html').send(html);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      return res.type('html').send(
        renderer(`${resendEmailPagePath}${Routes.RESEND}`, {
          requestState: state,
          pageTitle: resendEmailPageTitle,
        }),
      );
    }
  });

export const setPasswordTokenController = (
  setPasswordPath: string,
  setPasswordPageTitle: string,
  successCallback: (res: ResponseWithRequestState) => void,
) =>
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
        const html = renderer(`${setPasswordPath}/${token}`, {
          requestState: state,
          pageTitle: setPasswordPageTitle,
        });
        return res.status(422).type('html').send(html);
      }

      const cookies = await changePassword(password, token, req.ip);

      setIDAPICookies(res, cookies);

      // we need to track both of these cloudwatch metrics as two
      // separate metrics at this point as the changePassword endpoint
      // does two things
      // a) account verification
      // b) change password
      // since these could happen at different points in time, it's best
      // to keep them as two seperate metrics
      trackMetric(Metrics.ACCOUNT_VERIFICATION_SUCCESS);
      trackMetric(Metrics.CHANGE_PASSWORD_SUCCESS);

      return successCallback(res);
    } catch (error) {
      const { message, status } = error;
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      // see the comment above around the success metrics
      trackMetric(Metrics.ACCOUNT_VERIFICATION_FAILURE);
      trackMetric(Metrics.CHANGE_PASSWORD_FAILURE);

      const html = renderer(`${setPasswordPath}/${token}`, {
        requestState: deepmerge(state, {
          globalMessage: {
            error: message,
          },
        }),
        pageTitle: setPasswordPageTitle,
      });
      return res.status(status).type('html').send(html);
    }
  });
