import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { TEST_ID as OPT_IN_PROMPT_TEST_ID } from '@/shared/model/experiments/tests/opt-in-prompt';
import { addReturnUrlToPath } from '@/server/lib/queryParams';
import { CONSENTS_POST_SIGN_IN_PAGE, Consents } from '@/shared/model/Consent';
import { getUserConsentsForPage } from '@/server/lib/idapi/consents';
import { hasExperimentRun, setExperimentRan } from '@/server/lib/experiments';
import { IdapiCookies } from '@/shared/model/IDAPIAuth';

const { defaultReturnUri } = getConfiguration();

const postSignInController = async (
  req: Request,
  res: ResponseWithRequestState,
  idapiCookies: IdapiCookies,
  returnUrl?: string,
) => {
  const state = res.locals;
  const redirectUrl = returnUrl || defaultReturnUri;

  const optInPromptActive = await (async () => {
    if (!state.abTesting.participations[OPT_IN_PROMPT_TEST_ID]) {
      return false;
    }

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

    const consents = await getUserConsentsForPage(
      CONSENTS_POST_SIGN_IN_PAGE,
      req.ip,
      sc_gu_u,
    );

    return !consents.find(({ id }) => id === Consents.SUPPORTER)?.consented;
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
