import { Request } from 'express';

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
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { trackMetric } from '@/server/lib/trackMetric';
import {
  readEncryptedStateCookie,
  setEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { ApiError } from '@/server/models/Error';
import { PasswordRoutePath, RoutePaths } from '@/shared/model/Routes';
import { PasswordPageTitle } from '@/shared/model/PageTitle';
import { validatePasswordField } from '@/server/lib/validatePasswordField';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';

export const setPasswordController = (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
  successRedirectPath: RoutePaths,
) =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let requestState = res.locals;

    const { token } = req.params;
    const { password } = req.body;

    requestState = deepmerge(requestState, {
      pageData: {
        browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
      },
    });

    try {
      const fieldErrors = validatePasswordField(password);

      if (fieldErrors.length) {
        const { email, timeUntilTokenExpiry } = await validateToken(
          token,
          req.ip,
        );

        requestState = deepmerge(requestState, {
          pageData: {
            email,
            timeUntilTokenExpiry,
            fieldErrors,
          },
        });
        const html = renderer(
          `${path}/:token`,
          { requestState, pageTitle },
          { token },
        );
        return res.status(422).type('html').send(html);
      }

      const cookies = await changePassword(password, token, req.ip);

      setIDAPICookies(res, cookies);

      // if the user navigates back to the welcome page after they have set a password, this
      // ensures we show them a custom error page rather than the link expired page
      if (path === '/welcome') {
        const currentState = readEncryptedStateCookie(req);
        setEncryptedStateCookie(res, {
          ...currentState,
          passwordSetOnWelcomePage: true,
        });
      }

      // we need to track both of these cloudwatch metrics as two
      // separate metrics at this point as the changePassword endpoint
      // does two things
      // a) account verification
      // b) change password
      // since these could happen at different points in time, it's best
      // to keep them as two seperate metrics
      trackMetric('AccountVerification::Success');
      trackMetric('UpdatePassword::Success');

      return res.redirect(
        303,
        addQueryParamsToPath(successRedirectPath, requestState.queryParams),
      );
    } catch (error) {
      const { message, status, field } =
        error instanceof ApiError ? error : new ApiError();

      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      // see the comment above around the success metrics
      trackMetric('AccountVerification::Failure');
      trackMetric('UpdatePassword::Failure');

      // we unfortunately need this inner try catch block to catch
      // errors from the `validateToken` method were it to fail
      try {
        const { email, timeUntilTokenExpiry } = await validateToken(
          token,
          req.ip,
        );

        if (field) {
          requestState = deepmerge(requestState, {
            pageData: {
              email,
              timeUntilTokenExpiry,
              fieldErrors: [
                {
                  field,
                  message,
                },
              ],
            },
          });
        } else {
          requestState = deepmerge(requestState, {
            pageData: {
              email,
              timeUntilTokenExpiry,
            },
            globalMessage: {
              error: message,
            },
          });
        }

        const html = renderer(
          `${path}/:token`,
          { requestState, pageTitle },
          { token },
        );
        return res.status(status).type('html').send(html);
      } catch (error) {
        logger.error(`${req.method} ${req.originalUrl}  Error`, error);
        // if theres an error with the token validation, we have to take them back
        // to the resend page
        return res.type('html').send(
          renderer(`${path}/resend`, {
            requestState,
            pageTitle: `Resend ${pageTitle} Email`,
          }),
        );
      }
    }
  });
