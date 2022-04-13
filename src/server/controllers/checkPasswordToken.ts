import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { validate as validateTokenInIDAPI } from '@/server/lib/idapi/changePassword';
import deepmerge from 'deepmerge';
import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';
import {
  readEncryptedStateCookie,
  setEncryptedStateCookie,
  updateEncryptedStateCookie,
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
import { PersistableQueryParams } from '@/shared/model/QueryParams';

const { okta, defaultReturnUri } = getConfiguration();

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

    updateEncryptedStateCookie(req, res, { email, stateToken });

    trackMetric('OktaValidatePasswordToken::Success');

    // since we can't pass query parameters through okta emails, we set the encryptedStateCookie
    // as the email was sent to the user containing the query params at that time
    // so we read them here, if the user comes back on the same browser
    const encryptedState = readEncryptedStateCookie(req);

    // get query params from the encrypted state cookie, or set empty object if not found
    const encryptedStateQueryParams =
      encryptedState?.queryParams ?? ({} as PersistableQueryParams);

    // get the returnUrl
    const returnUrl: string = (() => {
      // check that the returnUrl in requestState is not the defaultReturnUri
      // as this suggests that it would have been modified, such as the native apps
      // setting the return url on email link intercept
      if (res.locals.queryParams.returnUrl !== defaultReturnUri) {
        return res.locals.queryParams.returnUrl;
      }
      // otherwise check the encrypted state cookie for a returnUrl
      // and use that
      if (encryptedStateQueryParams.returnUrl) {
        return encryptedStateQueryParams.returnUrl;
      }
      // finally use the defaultReturnUri if all else fails
      return defaultReturnUri;
    })();

    // finally generate the queryParams object to merge in with the requestState
    // with the correct returnUrl for this request
    const queryParams = deepmerge(encryptedStateQueryParams, {
      returnUrl,
    });

    const html = renderer(
      `${path}/:token`,
      {
        pageTitle,
        requestState: deepmerge(res.locals, {
          queryParams,
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
