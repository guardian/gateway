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
import { logger } from '@/server/lib/logger';
import { PasswordRoutePath } from '@/shared/model/Routes';
import { PasswordPageTitle } from '@/shared/model/PageTitle';

export const checkPasswordTokenController = (
  path: PasswordRoutePath,
  pageTitle: PasswordPageTitle,
) =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
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
        const { email, passwordSetOnWelcomePage } =
          readEncryptedStateCookie(req) ?? {};
        if (passwordSetOnWelcomePage) {
          requestState = deepmerge(requestState, {
            pageData: {
              email,
            },
          });
          return res.type('html').send(
            renderer(`${path}/complete`, {
              requestState,
              pageTitle,
            }),
          );
        }
      }
      return res.type('html').send(
        renderer(`${path}/resend`, {
          requestState,
          pageTitle: `Resend ${pageTitle} Email`,
        }),
      );
    }
  });
