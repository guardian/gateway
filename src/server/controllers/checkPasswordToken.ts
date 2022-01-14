import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { validate as validateToken } from '@/server/lib/idapi/changePassword';
import deepmerge from 'deepmerge';
import { getBrowserNameFromUserAgent } from '@/server/lib/getBrowserName';
import {
  readEncryptedStateCookie,
  setEncryptedStateCookie,
} from '@/server/lib/encryptedStateCookie';
import { renderer } from '@/server/lib/renderer';
import { logger } from '@/server/lib/winstonLogger';
import { PasswordRoutePath } from '@/shared/model/Routes';
import { PasswordPageTitle } from '@/shared/model/PageTitle';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { authenticate as authenticateWithOkta } from '@/server/lib/okta/api/authentication';

const { okta } = getConfiguration();

export const checkPasswordTokenController = (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
) =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { useOkta } = res.locals.queryParams;
    if (okta.registrationEnabled && useOkta && path === '/welcome') {
      await OktaAuthentication(path, pageTitle, req, res);
    } else {
      let requestState = res.locals;
      const { token } = req.params;

      try {
        const { email, timeUntilTokenExpiry } = await validateToken(
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
    }
  });

const OktaAuthentication = async (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
  req: Request,
  res: ResponseWithRequestState,
) => {
  let requestState = res.locals;
  const { token } = req.params;

  try {
    const { stateToken, expiresAt, _embedded } = await authenticateWithOkta({
      token,
    });
    const email = _embedded?.user.profile.email;
    const timeUntilTokenExpiry = Date.parse(expiresAt) - Date.now();

    setEncryptedStateCookie(res, { email, stateToken });

    requestState = deepmerge(requestState, {
      pageData: {
        browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
        email,
        timeUntilTokenExpiry,
      },
    });

    return res
      .type('html')
      .send(renderer(`${path}/:token`, { requestState, pageTitle }, { token }));
  } catch (error) {
    logger.error('Okta Token authentication failure', error);
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
