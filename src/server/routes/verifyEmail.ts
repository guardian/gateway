import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { getProfileUrl } from '@/server/lib/getProfileUrl';
import { read as getUser } from '@/server/lib/idapi/user';
import {
  send as sendVerificationEmail,
  verifyEmail,
} from '@/server/lib/idapi/verifyEmail';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { trackMetric } from '@/server/lib/trackMetric';
import { ApiError } from '@/server/models/Error';
import { ResponseWithRequestState } from '@/server/models/Express';
import { consentPages } from '@/server/routes/consents';
import { addQueryParamsToPath } from '@/shared/lib/queryParams';
import { ConsentsErrors, VerifyEmailErrors } from '@/shared/model/Errors';
import { EMAIL_SENT } from '@/shared/model/Success';
import { buildUrl } from '@/shared/lib/routeUtils';
import deepmerge from 'deepmerge';
import { Request, Router } from 'express';
import handleRecaptcha from '@/server/lib/recaptcha';

const router = Router();

const { signInPageUrl } = getConfiguration();
const profileUrl = getProfileUrl();

router.get(
  '/verify-email',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;

    state = deepmerge(state, {
      pageData: {
        signInPageUrl: `${signInPageUrl}?returnUrl=${encodeURIComponent(
          `${profileUrl}${buildUrl('/verify-email')}`,
        )}`,
      },
    });

    let status = 200;

    try {
      const sc_gu_u = req.cookies.SC_GU_U;

      if (!sc_gu_u) {
        throw new ApiError({
          status: 403,
          message: ConsentsErrors.ACCESS_DENIED,
        });
      }

      const { primaryEmailAddress } = await getUser(req.ip, sc_gu_u);
      state = deepmerge(state, {
        pageData: {
          email: primaryEmailAddress,
        },
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      const { message, status: errorStatus } =
        error instanceof ApiError ? error : new ApiError();

      status = errorStatus;

      if (status === 500) {
        state = deepmerge(state, {
          globalMessage: {
            error: message,
          },
        });
      }
    }

    const html = renderer('/verify-email', {
      pageTitle: 'Verify Email',
      requestState: state,
    });

    return res.status(status).type('html').send(html);
  }),
);

router.post(
  '/verify-email',
  handleRecaptcha,
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    let state = res.locals;
    let status = 200;

    try {
      const sc_gu_u = req.cookies.SC_GU_U;

      if (!sc_gu_u) {
        throw new ApiError({
          status: 403,
          message: ConsentsErrors.ACCESS_DENIED,
        });
      }

      const { email = (await getUser(req.ip, sc_gu_u)).primaryEmailAddress } =
        req.body;

      state = deepmerge(state, {
        pageData: {
          email,
        },
      });

      await sendVerificationEmail(req.ip, sc_gu_u);
      trackMetric('SendValidationEmail::Success');

      state = deepmerge(state, {
        globalMessage: {
          success: EMAIL_SENT.SUCCESS,
        },
      });
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      trackMetric('SendValidationEmail::Failure');

      const { message, status: errorStatus } =
        error instanceof ApiError ? error : new ApiError();

      status = errorStatus;

      state = deepmerge(state, {
        globalMessage: {
          error: message,
        },
      });
    }

    const html = renderer('/verify-email', {
      pageTitle: 'Verify Email',
      requestState: state,
    });

    return res.status(status).type('html').send(html);
  }),
);

router.get(
  '/verify-email/:token',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { token } = req.params;

    try {
      const cookies = await verifyEmail(token, req.ip);
      trackMetric('EmailValidated::Success');
      setIDAPICookies(res, cookies);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);

      const { message } = error instanceof ApiError ? error : new ApiError();

      if (message === VerifyEmailErrors.USER_ALREADY_VALIDATED) {
        return res.redirect(
          303,
          addQueryParamsToPath(
            `${consentPages[0].path}`,
            res.locals.queryParams,
          ),
        );
      }

      trackMetric('EmailValidated::Failure');

      return res.redirect(
        303,
        addQueryParamsToPath('/verify-email', res.locals.queryParams),
      );
    }

    return res.redirect(
      303,
      addQueryParamsToPath(`${consentPages[0].path}`, res.locals.queryParams, {
        emailVerified: true,
      }),
    );
  }),
);

export default router;
