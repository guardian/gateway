import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { validate as validateTokenInIDAPI } from '@/server/lib/idapi/changePassword';
import deepmerge from 'deepmerge';
import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';
import {
  readEncryptedStateCookie,
  setEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { renderer } from '@/server/lib/renderer';
import { logger } from '@/server/lib/serverSideLogger';
import { PasswordRoutePath } from '@/shared/model/Routes';
import { PasswordPageTitle } from '@/shared/model/PageTitle';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { validateRecoveryToken as validateTokenInOkta } from '@/server/lib/okta/api/authentication';
import { trackMetric } from '@/server/lib/trackMetric';
import { ChangePasswordErrors } from '@/shared/model/Errors';
import { FieldError } from '@/shared/model/ClientState';

const { okta } = getConfiguration();

const handleBackButtonEventOnWelcomePage = (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
  req: Request,
  res: ResponseWithRequestState,
) => {
  const { email, passwordSetOnWelcomePage } =
    readEncryptedStateCookie(req) ?? {};
  const requestState = deepmerge(res.locals, {
    pageData: {
      email,
    },
  });
  if (passwordSetOnWelcomePage) {
    return res.type('html').send(
      renderer(`${path}/complete`, {
        requestState,
        pageTitle,
      }),
    );
  } else {
    return res.type('html').send(
      renderer(`${path}/resend`, {
        requestState,
        pageTitle: `Resend ${pageTitle} Email`,
      }),
    );
  }
};

const checkTokenInIDAPI = async (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
  req: Request,
  res: ResponseWithRequestState,
) => {
  let requestState = res.locals;
  const { token } = req.params;

  try {
    const { email, timeUntilTokenExpiry } = await validateTokenInIDAPI(
      token,
      req.ip,
    );

    requestState = deepmerge(requestState, {
      pageData: {
        browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
        email,
        timeUntilTokenExpiry,
      },
    });

    // add email to encrypted state, so we can display it on the confirmation page
    setEncryptedStateCookie(res, { email });

    trackMetric('ValidatePasswordToken::Success');

    const html = renderer(
      `${path}/:token`,
      { requestState, pageTitle },
      { token },
    );
    return res.type('html').send(html);
  } catch (error) {
    logger.error(`${req.method} ${req.originalUrl}  Error`, error);

    if (path === '/welcome') {
      handleBackButtonEventOnWelcomePage(path, pageTitle, req, res);
    } else {
      return res.type('html').send(
        renderer(`${path}/resend`, {
          requestState,
          pageTitle: `Resend ${pageTitle} Email`,
        }),
      );
    }
  }
};

export const checkTokenInOkta = async (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
  req: Request,
  res: ResponseWithRequestState,
  error?: ChangePasswordErrors,
  fieldErrors?: Array<FieldError>,
) => {
  const { token } = req.params;

  try {
    const { stateToken, expiresAt, _embedded } = await validateTokenInOkta({
      recoveryToken: token,
    });
    const email = _embedded?.user.profile.login;
    const timeUntilTokenExpiry =
      expiresAt && Date.parse(expiresAt) - Date.now();

    setEncryptedStateCookie(res, { email, stateToken });

    trackMetric('OktaValidatePasswordToken::Success');

    const html = renderer(
      `${path}/:token`,
      {
        pageTitle,
        requestState: deepmerge(res.locals, {
          pageData: {
            browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
            email,
            timeUntilTokenExpiry,
            fieldErrors,
          },
          globalMessage: {
            error,
          },
        }),
      },
      { token },
    );

    return res.type('html').send(html);
  } catch (error) {
    logger.error('Okta validate password token failure', error);

    trackMetric('OktaValidatePasswordToken::Failure');

    if (path === '/welcome') {
      handleBackButtonEventOnWelcomePage(path, pageTitle, req, res);
    } else {
      const html = renderer(`${path}/resend`, {
        pageTitle: `Resend ${pageTitle} Email`,
        requestState: res.locals,
      });
      return res.type('html').send(html);
    }
  }
};

export const checkPasswordTokenController = (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
) =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { useOkta } = res.locals.queryParams;
    if (okta.enabled && useOkta) {
      await checkTokenInOkta(path, pageTitle, req, res);
    } else {
      await checkTokenInIDAPI(path, pageTitle, req, res);
    }
  });
