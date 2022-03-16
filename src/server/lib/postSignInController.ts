import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { addReturnUrlToPath } from '@/server/lib/queryParams';
import { CONSENTS_POST_SIGN_IN_PAGE, Consents } from '@/shared/model/Consent';
import { getUserConsentsForPage } from '@/server/lib/idapi/consents';
import { hasExperimentRun, setExperimentRan } from '@/server/lib/experiments';
import { IdapiCookies } from '@/shared/model/IDAPIAuth';
import { logger } from '@/server/lib/serverSideLogger';

const OPT_IN_PROMPT_TEST_ID = 'OptInPromptPostSignIn';

const { defaultReturnUri } = getConfiguration();

const postSignInController = async (
  req: Request,
  res: ResponseWithRequestState,
  idapiCookies: IdapiCookies,
  returnUrl?: string,
) => {
  const redirectUrl = returnUrl || defaultReturnUri;

  const optInPromptActive = await (async () => {
    // Treating paths that only differ due to trailing slash as equivalent
    const noTrailingSlash = (str: string) => str.replace(/\/$/, '');
    if (noTrailingSlash(redirectUrl) !== noTrailingSlash(defaultReturnUri)) {
      return false;
    }

    if (hasExperimentRun(req, OPT_IN_PROMPT_TEST_ID)) {
      return false;
    } else {
      setExperimentRan(req, res, OPT_IN_PROMPT_TEST_ID, true);
    }

    const sc_gu_u = idapiCookies.values.find(
      ({ key }) => key === 'SC_GU_U',
    )?.value;

    if (!sc_gu_u) {
      return false;
    }

    try {
      const consents = await getUserConsentsForPage(
        CONSENTS_POST_SIGN_IN_PAGE,
        req.ip,
        sc_gu_u,
      );

      return !consents.find(({ id }) => id === Consents.SUPPORTER)?.consented;
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      return false;
    }
  })();

  if (optInPromptActive) {
    return res.redirect(
      303,
      addReturnUrlToPath('/signin/success', redirectUrl),
    );
  }

  return res.redirect(303, redirectUrl);
};

export default postSignInController;
