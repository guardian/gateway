import { Router, Request, Response } from 'express';
import { Routes } from '@/shared/model/Routes';
import {
  send as sendVerificationEmail,
  verifyEmail,
} from '@/server/lib/idapi/verifyEmail';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { consentPages } from '@/server/routes/consents';
import { read as getUser } from '@/server/lib/idapi/user';
import { ConsentsErrors, VerifyEmailErrors } from '@/shared/model/Errors';
import { getConfiguration } from '@/server/lib/configuration';
import { getProfileUrl } from '@/server/lib/baseUri';
import { getProviderForEmail } from '@/shared/lib/emailProvider';
import { trackMetric } from '@/server/lib/AWS';
import { Metrics } from '@/server/models/Metrics';
import { addReturnUrlToPath } from '@/server/lib/queryParams';
import { PageTitle } from '@/shared/model/PageTitle';
import { ResponseWithLocals } from '@/server/models/Express';

const router = Router();

const { signInPageUrl } = getConfiguration();
const profileUrl = getProfileUrl();

router.get(
  Routes.VERIFY_EMAIL,
  async (req: Request, res: ResponseWithLocals) => {
    res.locals.pageData.signInPageUrl = `${signInPageUrl}?returnUrl=${encodeURIComponent(
      `${profileUrl}${Routes.VERIFY_EMAIL}`,
    )}`;

    let status = 200;

    try {
      const sc_gu_u = req.cookies.SC_GU_U;

      if (!sc_gu_u) {
        throw { status: 403, message: ConsentsErrors.ACCESS_DENIED };
      }

      const { primaryEmailAddress } = await getUser(req.ip, sc_gu_u);
      res.locals.pageData.email = primaryEmailAddress;
    } catch (error) {
      status = error.status;

      if (status === 500) {
        res.locals.globalMessage.error = error.message;
      }
    }

    const html = renderer(Routes.VERIFY_EMAIL, {
      pageTitle: PageTitle.VERIFY_EMAIL,
      locals: res.locals,
    });

    return res.status(status).type('html').send(html);
  },
);

router.post(
  Routes.VERIFY_EMAIL,
  async (req: Request, res: ResponseWithLocals) => {
    let status = 200;

    try {
      const sc_gu_u = req.cookies.SC_GU_U;

      if (!sc_gu_u) {
        throw { status: 403, message: ConsentsErrors.ACCESS_DENIED };
      }

      const {
        email = (await getUser(req.ip, sc_gu_u)).primaryEmailAddress,
      } = req.body;

      res.locals.pageData.email = email;

      await sendVerificationEmail(req.ip, sc_gu_u);
      trackMetric(Metrics.SEND_VALIDATION_EMAIL_SUCCESS);

      res.locals.globalMessage.success =
        'Email Sent. Please check your inbox and follow the link.';

      const emailProvider = getProviderForEmail(email);
      if (emailProvider) {
        res.locals.pageData.emailProvider = emailProvider.id;
      }
    } catch (error) {
      trackMetric(Metrics.SEND_VALIDATION_EMAIL_FAILURE);
      status = error.status;
      res.locals.globalMessage.error = error.message;
    }

    const html = renderer(Routes.VERIFY_EMAIL, {
      pageTitle: PageTitle.VERIFY_EMAIL,
      locals: res.locals,
    });

    return res.status(status).type('html').send(html);
  },
);

router.get(
  `${Routes.VERIFY_EMAIL}${Routes.VERIFY_EMAIL_TOKEN}`,
  async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
      const cookies = await verifyEmail(token, req.ip);
      trackMetric(Metrics.EMAIL_VALIDATED_SUCCESS);
      setIDAPICookies(res, cookies);
    } catch (error) {
      logger.error(error);

      if (error.message === VerifyEmailErrors.USER_ALREADY_VALIDATED) {
        return res.redirect(
          303,
          addReturnUrlToPath(
            `${Routes.CONSENTS}/${consentPages[0].page}`,
            res.locals.queryParams.returnUrl,
          ),
        );
      }

      trackMetric(Metrics.EMAIL_VALIDATED_FAILURE);

      return res.redirect(303, `${Routes.VERIFY_EMAIL}`);
    }

    return res.redirect(
      303,
      addReturnUrlToPath(
        `${Routes.CONSENTS}/${consentPages[0].page}?emailVerified=true`,
        res.locals.queryParams.returnUrl,
      ),
    );
  },
);

export default router;
