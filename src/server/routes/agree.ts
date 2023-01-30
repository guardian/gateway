import { Request, Response } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { renderer } from '@/server/lib/renderer';
import { read } from '../lib/idapi/user';
import { logger } from '../lib/serverSideLogger';
import { getConfiguration } from '../lib/getConfiguration';
import { trackMetric } from '../lib/trackMetric';
import deepmerge from 'deepmerge';
import { addQueryParamsToUntypedPath } from '@/shared/lib/queryParams';
import { setupJobsUserInIDAPI, setupJobsUserInOkta } from '../lib/jobs';
import { getSession } from '../lib/okta/api/sessions';
import { getUser } from '../lib/okta/api/users';
import { mergeRequestState } from '@/server/lib/requestState';

const { defaultReturnUri, signInPageUrl, okta } = getConfiguration();

const IDAPIAgreeGetController = async (req: Request, res: Response) => {
  const SC_GU_U = req.cookies.SC_GU_U;
  const state = res.requestState;
  const { returnUrl } = state.queryParams;

  // Redirect to /signin if no session cookie.
  if (!SC_GU_U) {
    return res.redirect(
      303,
      addQueryParamsToUntypedPath(signInPageUrl, res.requestState.queryParams),
    );
  }

  try {
    const {
      primaryEmailAddress,
      privateFields: { firstName, secondName },
      userGroups,
    } = await read(req.ip, SC_GU_U, res.requestState.requestId);

    const userBelongsToGRS = userGroups.some(
      (group) => group.packageCode === 'GRS',
    );

    const userFullNameSet = !!firstName && !!secondName;

    // The user is redirected immediately if they are already
    // part of the group and have their name set.
    if (userBelongsToGRS && userFullNameSet) {
      const redirectUrl = returnUrl || defaultReturnUri;
      return res.redirect(
        303,
        addQueryParamsToUntypedPath(redirectUrl, {
          ...res.requestState.queryParams,
          returnUrl: '', // unset returnUrl so redirect won't point to itself.
        }),
      );
    }

    const html = renderer('/agree/GRS', {
      requestState: mergeRequestState(res.requestState, {
        pageData: {
          firstName,
          secondName,
          userBelongsToGRS,
          email: primaryEmailAddress,
        },
      }),
      pageTitle: 'Jobs',
    });

    return res.type('html').send(html);
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} Error fetching Jobs user in IDAPI`,
      error,
      {
        request_id: res.requestState.requestId,
      },
    );
    // Redirect to /signin if an error occurs when fetching the users' data.
    return res.redirect(
      303,
      addQueryParamsToUntypedPath(signInPageUrl, res.requestState.queryParams),
    );
  }
};

const OktaAgreeGetController = async (req: Request, res: Response) => {
  const oktaSessionCookieId: string | undefined = req.cookies.sid;

  const state = res.requestState;
  const { returnUrl, fromURI } = state.queryParams;

  // Redirect to /signin if no session cookie.
  if (!oktaSessionCookieId) {
    return res.redirect(
      303,
      addQueryParamsToUntypedPath(signInPageUrl, res.requestState.queryParams),
    );
  }

  try {
    const { userId } = await getSession(oktaSessionCookieId);
    const { profile } = await getUser(userId);
    const { isJobsUser, firstName, lastName, email } = profile;

    const userFullNameSet = !!firstName && !!lastName;

    // The user is redirected immediately if they are already
    // a jobs user and have they have their full name set.
    if (isJobsUser && userFullNameSet) {
      // complete the oauth flow if coming from the okta sign in page
      // through the oauth flow initiated by the jobs site
      if (fromURI) {
        return res.redirect(303, fromURI);
      }

      // otherwise try going to the return url
      const redirectUrl = returnUrl || defaultReturnUri;
      return res.redirect(
        303,
        addQueryParamsToUntypedPath(redirectUrl, {
          ...res.requestState.queryParams,
          returnUrl: '', // unset returnUrl so redirect won't point to itself.
        }),
      );
    }

    const html = renderer('/agree/GRS', {
      requestState: deepmerge(res.requestState, {
        pageData: {
          firstName,
          secondName: lastName,
          userBelongsToGRS: isJobsUser,
          email,
        },
      }),
      pageTitle: 'Jobs',
    });

    return res.type('html').send(html);
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} Error fetching Jobs user in Okta`,
      error,
      {
        request_id: res.requestState.requestId,
      },
    );
    // Redirect to /signin if an error occurs when fetching the users' data.
    return res.redirect(
      303,
      addQueryParamsToUntypedPath(signInPageUrl, res.requestState.queryParams),
    );
  }
};

router.get('/agree/GRS', (req: Request, res: Response) => {
  const { useIdapi } = res.requestState.queryParams;

  if (okta.enabled && !useIdapi) {
    return OktaAgreeGetController(req, res);
  } else {
    return IDAPIAgreeGetController(req, res);
  }
});

router.post('/agree/GRS', async (req: Request, res: Response) => {
  const { useIdapi, returnUrl, fromURI } = res.requestState.queryParams;
  const oktaSessionCookieId: string | undefined = req.cookies.sid;

  const { firstName, secondName } = req.body;

  try {
    if (okta.enabled && !useIdapi && oktaSessionCookieId) {
      // Get the id from Okta
      const { userId } = await getSession(oktaSessionCookieId);
      await setupJobsUserInOkta(firstName, secondName, userId);
      trackMetric('JobsGRSGroupAgree::Success');
    } else {
      await setupJobsUserInIDAPI(
        firstName,
        secondName,
        req.ip,
        req.cookies.SC_GU_U,
        res.requestState.requestId,
      );
      trackMetric('JobsGRSGroupAgree::Success');
    }
  } catch (error) {
    logger.error(
      `${req.method} ${req.originalUrl} Error updating Jobs user information`,
      error,
      {
        request_id: res.requestState.requestId,
      },
    );
    trackMetric('JobsGRSGroupAgree::Failure');
  } finally {
    // complete the oauth flow if coming from the okta sign in page
    // through the oauth flow initiated by the jobs site
    if (fromURI) {
      return res.redirect(303, fromURI);
    }
    // otherwise try going to the return url
    return res.redirect(303, returnUrl);
  }
});

export default router.router;
