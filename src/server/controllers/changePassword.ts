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
import { getConfiguration } from '@/server/lib/getConfiguration';
import { resetPassword as resetPasswordInOkta } from '@/server/lib/okta/api/authentication';
import { stringify } from 'query-string';
import { OktaError } from '@/server/models/okta/Error';
import { addToGroup, GroupCode } from '@/server/lib/idapi/user';

const { baseUri, okta } = getConfiguration();

export const setPasswordController = (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
  successRedirectPath: RoutePaths,
) =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { useOkta } = res.locals.queryParams;
    if (okta.registrationEnabled && useOkta && path === '/welcome') {
      await OktaSetPassword(path, pageTitle, req, res);
    } else {
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

        if (cookies) {
          setIDAPICookies(res, cookies);
        }

        // if the user navigates back to the welcome page after they have set a password, this
        // ensures we show them a custom error page rather than the link expired page
        if (path === '/welcome') {
          const currentState = readEncryptedStateCookie(req);
          setEncryptedStateCookie(res, {
            ...currentState,
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
    }
  });

const OktaSetPassword = async (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
  req: Request,
  res: ResponseWithRequestState,
) => {
  const { stateToken } = readEncryptedStateCookie(req) ?? {};
  const { password } = req.body;

  try {
    if (stateToken) {
      const { sessionToken } = await resetPasswordInOkta({
        stateToken,
        newPassword: password,
      });
      trackMetric('OktaSetPasswordOnWelcomePage::Success');

      if (path === '/welcome') {
        const currentState = readEncryptedStateCookie(req);
        setEncryptedStateCookie(res, {
          ...currentState,
          passwordSetOnWelcomePage: true,
        });
      }

      // TODO: Authentication in Okta, this kicks off a oauth code flow but will 404 until authentication is built
      const params = {
        client_id: okta.clientId,
        response_type: 'code',
        scope: 'openid',
        prompt: 'none',
        redirect_uri: `https://${baseUri}/oauth/authorization-code/callback`,
        sessionToken,
      };
      return res.redirect(
        303,
        `${okta.orgUrl}/oauth2/${okta.authServerId}/v1/authorize?${stringify(
          params,
        )}`,
      );
    } else {
      throw new OktaError(
        `Okta State token not found when attempting to set password`,
      );
    }
  } catch (error) {
    const requestState = res.locals;
    logger.error(`Okta Set Password Failure`, error);
    trackMetric('OktaSetPasswordOnWelcomePage::Failure');
    return res.type('html').send(
      renderer(`${path}/resend`, {
        requestState,
        pageTitle: `Resend ${pageTitle} Email`,
      }),
    );
  }
};
