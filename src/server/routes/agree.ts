import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { read } from '../lib/idapi/user';
import { logger } from '../lib/serverSideLogger';
import { getConfiguration } from '../lib/getConfiguration';
import { trackMetric } from '../lib/trackMetric';
import deepmerge from 'deepmerge';
import { addQueryParamsToUntypedPath } from '@/shared/lib/queryParams';
import setupJobsUser from '../lib/jobs';

const { defaultReturnUri } = getConfiguration();

router.get(
  '/agree/GRS',
  async (req: Request, res: ResponseWithRequestState) => {
    const SC_GU_U = req.cookies.SC_GU_U;
    const state = res.locals;
    const { returnUrl } = state.pageData;
    const { signInPageUrl } = getConfiguration();

    // Redirect to /signin if no session cookie.
    if (!SC_GU_U) {
      return res.redirect(
        303,
        addQueryParamsToUntypedPath(signInPageUrl, res.locals.queryParams),
      );
    }

    try {
      const {
        primaryEmailAddress,
        privateFields: { firstName, secondName },
        userGroups,
      } = await read(req.ip, SC_GU_U);

      const userBelongsToGRS = userGroups.find(
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
            ...res.locals.queryParams,
            returnUrl: '', // unset returnUrl so redirect won't point to itself.
          }),
        );
      }

      const html = renderer('/agree/GRS', {
        requestState: deepmerge(res.locals, {
          pageData: {
            firstName,
            secondName,
            email: primaryEmailAddress,
          },
        }),
        pageTitle: 'Jobs',
      });

      return res.type('html').send(html);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} Error`, error);
      // Redirect to /signin if an error occurs when fetching the users' data.
      return res.redirect(
        303,
        addQueryParamsToUntypedPath(signInPageUrl, res.locals.queryParams),
      );
    }
  },
);

router.post(
  '/agree/GRS',
  async (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;
    const { firstName, secondName } = req.body;
    const { returnUrl } = state.pageData;
    const redirectUrl = returnUrl || defaultReturnUri;
    try {
      await setupJobsUser(firstName, secondName, req.ip, req.cookies.SC_GU_U);
      trackMetric('JobsGRSGroupAgree::Success');
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl} Error`, error);
      trackMetric('JobsGRSGroupAgree::Failure');
    } finally {
      return res.redirect(303, redirectUrl);
    }
  },
);

export default router.router;
