import { Router, Request, Response } from 'express';
import { Routes } from '@/shared/model/Routes';
import {
  send as sendVerificationEmail,
  verifyEmail,
} from '@/server/lib/idapi/verifyEmail';
import { setIDAPICookies } from '@/server/lib/setIDAPICookies';
import { logger } from '@/server/lib/logger';
import { renderer } from '@/server/lib/renderer';
import { GlobalState } from '@/shared/model/GlobalState';
import { consentPages } from '@/server/routes/consents';
import { read as getUser } from '@/server/lib/idapi/user';
import { ConsentsErrors } from '@/shared/model/Errors';
import { getConfiguration } from '@/server/lib/configuration';
import { getProfileUrl } from '@/server/lib/baseUri';
import { getProviderForEmail } from '@/shared/lib/emailProvider';

const router = Router();

const { signInPageUrl } = getConfiguration();
const profileUrl = getProfileUrl();

router.get(Routes.VERIFY_EMAIL, async (req: Request, res: Response) => {
  const state: GlobalState = {
    signInPageUrl: `${signInPageUrl}?returnUrl=${encodeURIComponent(
      `${profileUrl}${Routes.VERIFY_EMAIL}`,
    )}`,
  };

  let status = 200;

  try {
    const sc_gu_u = req.cookies.SC_GU_U;

    if (!sc_gu_u) {
      throw { status: 403, message: ConsentsErrors.ACCESS_DENIED };
    }

    const { primaryEmailAddress } = await getUser(req.ip, sc_gu_u);
    state.email = primaryEmailAddress;
  } catch (error) {
    status = error.status;

    if (status === 500) {
      state.error = error.message;
    }
  }

  const html = renderer(Routes.VERIFY_EMAIL, {
    globalState: state,
  });

  return res.status(status).type('html').send(html);
});

router.post(Routes.VERIFY_EMAIL, async (req: Request, res: Response) => {
  const state: GlobalState = {};

  let status = 200;

  try {
    const sc_gu_u = req.cookies.SC_GU_U;

    if (!sc_gu_u) {
      throw { status: 403, message: ConsentsErrors.ACCESS_DENIED };
    }

    const {
      email = (await getUser(req.ip, sc_gu_u)).primaryEmailAddress,
    } = req.body;

    state.email = email;

    sendVerificationEmail(req.ip, sc_gu_u);

    state.success = 'Email Sent. Please check your inbox and follow the link.';

    const emailProvider = getProviderForEmail(email);
    if (emailProvider) {
      state.emailProvider = emailProvider.id;
    }
  } catch (error) {
    status = error.status;
    state.error = error.message;
  }

  const html = renderer(Routes.VERIFY_EMAIL, {
    globalState: state,
  });

  return res.status(status).type('html').send(html);
});

router.get(
  `${Routes.VERIFY_EMAIL}${Routes.VERIFY_EMAIL_TOKEN}`,
  async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
      const cookies = await verifyEmail(token, req.ip);
      setIDAPICookies(res, cookies);
    } catch (error) {
      logger.error(error);

      return res.redirect(303, `${Routes.VERIFY_EMAIL}`);
    }

    return res.redirect(303, `${Routes.CONSENTS}/${consentPages[0].page}`);
  },
);

export default router;
