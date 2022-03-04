import { Request } from 'express';

import deepmerge from 'deepmerge';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';
import { logger } from '@/server/lib/serverSideLogger';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import {
  validate as validateToken,
  change as changePassword,
} from '@/server/lib/idapi/changePassword';
import { setIDAPICookies } from '@/server/lib/idapi/IDAPICookies';
import { trackMetric } from '@/server/lib/trackMetric';
import {
  readEncryptedStateCookie,
  updateEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { ApiError } from '@/server/models/Error';
import { PasswordRoutePath, RoutePaths } from '@/shared/model/Routes';
import { PasswordPageTitle } from '@/shared/model/PageTitle';
import {
  getErrorMessage,
  validatePasswordField,
  validatePasswordFieldForOkta,
} from '@/server/lib/validatePasswordField';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { resetPassword as resetPasswordInOkta } from '@/server/lib/okta/api/authentication';
import { OktaError } from '@/server/models/okta/Error';
import { addToGroup, GroupCode } from '@/server/lib/idapi/user';
import { checkTokenInOkta } from '@/server/controllers/checkPasswordToken';
import { performAuthCodeFlow } from '@/server/routes/signIn';

const { okta } = getConfiguration();

const changePasswordInIDAPI = async (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
  req: Request,
  res: ResponseWithRequestState,
  successRedirectPath: RoutePaths,
) => {
  let requestState = res.locals;

  const { token } = req.params;
  const { clientId } = req.query;
  const { password } = req.body;

  requestState = deepmerge(requestState, {
    pageData: {
      browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
    },
  });

  try {
    validatePasswordField(password);

    const cookies = await changePassword(password, token, req.ip);

    if (cookies) {
      setIDAPICookies(res, cookies);
    }

    // if the user navigates back to the welcome page after they have set a password, this
    // ensures we show them a custom error page rather than the link expired page
    if (path === '/welcome') {
      updateEncryptedStateCookie(req, res, {
        passwordSetOnWelcomePage: true,
      });
    }

    // When a jobs user is registering, we'd like to add them to the GRS group.
    // We only do this for users going through the welcome flow.
    //
    // Once they belong to this group, they aren't shown a confirmation page when-
    // they first visit the jobs site.
    //
    // If the SC_GU_U cookie exists, we try to add the user to the group.
    // If the cookie doesn't exist for some reason, we log the incident.
    if (clientId === 'jobs' && path === '/welcome') {
      const SC_GU_U = cookies?.values.find(({ key }) => key === 'SC_GU_U');
      if (SC_GU_U) {
        await addToGroup(GroupCode.GRS, req.ip, SC_GU_U.value);
      } else {
        logger.error(
          'Failed to add the user to the GRS group because the SC_GU_U cookie is not set.',
        );
      }
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
};

const changePasswordInOkta = async (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
  req: Request,
  res: ResponseWithRequestState,
  successRedirectPath: RoutePaths,
) => {
  const { stateToken } = readEncryptedStateCookie(req) ?? {};
  const { password } = req.body;

  try {
    validatePasswordFieldForOkta(password);

    if (stateToken) {
      const { sessionToken } = await resetPasswordInOkta({
        stateToken,
        newPassword: password,
      });

      trackMetric('OktaUpdatePassword::Success');

      if (path === '/welcome') {
        updateEncryptedStateCookie(req, res, {
          passwordSetOnWelcomePage: true,
        });
      }

      // TODO: once sign out with Okta has been implemented, invalidate current sessions before kicking off code flow
      return performAuthCodeFlow(res, sessionToken, successRedirectPath);
    } else {
      throw new OktaError({ message: 'Okta state token missing' });
    }
  } catch (error) {
    logger.error('Okta change password failure', error);

    trackMetric('OktaUpdatePassword::Failure');

    const { globalError, fieldErrors } = getErrorMessage(error);

    await checkTokenInOkta(path, pageTitle, req, res, globalError, fieldErrors);
  }
};

export const setPasswordController = (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
  successRedirectPath: RoutePaths,
) =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { useOkta } = res.locals.queryParams;
    if (okta.enabled && useOkta) {
      await changePasswordInOkta(
        path,
        pageTitle,
        req,
        res,
        successRedirectPath,
      );
    } else {
      await changePasswordInIDAPI(
        path,
        pageTitle,
        req,
        res,
        successRedirectPath,
      );
    }
  });
