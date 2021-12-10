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
import {
  ValidPasswordResendEmailRoutePaths,
  ValidPasswordRoutePaths,
} from '@/shared/model/Routes';
import { PageTitle } from '@/shared/model/PageTitle';

export const checkPasswordTokenController = (
  setPasswordPagePath: ValidPasswordRoutePaths,
  setPasswordPageTitle: PageTitle,
  resendEmailPagePath: ValidPasswordResendEmailRoutePaths,
  resendEmailPageTitle: PageTitle,
) =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;
    const { token } = req.params;

    try {
      const { email, timeUntilTokenExpiry } = await validateToken(
        token,
        req.ip,
      );

      state = deepmerge(state, {
        pageData: {
          browserName: getBrowserNameFromUserAgent(req.header('User-Agent')),
          email,
          timeUntilTokenExpiry,
        },
      });

      // set the encrypted state here, so we can read the email
      // on the confirmation page
      setEncryptedStateCookie(res, { email });

      const html = renderer(
        `${setPasswordPagePath}${'/:token'}`,
        {
          requestState: state,
          pageTitle: setPasswordPageTitle,
        },
        { token },
      );
      return res.type('html').send(html);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      if (setPasswordPagePath === '/welcome') {
        const { email, passwordSetOnWelcomePage } =
          readEncryptedStateCookie(req) ?? {};
        if (passwordSetOnWelcomePage) {
          state = deepmerge(state, {
            pageData: {
              email,
            },
          });
          return res.type('html').send(
            renderer(`${resendEmailPagePath}${'/complete'}`, {
              requestState: state,
              pageTitle: resendEmailPageTitle,
            }),
          );
        }
      }
      return res.type('html').send(
        renderer(`${resendEmailPagePath}${'/resend'}`, {
          requestState: state,
          pageTitle: resendEmailPageTitle,
        }),
      );
    }
  });
