import { Request } from 'express';

import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { addToGroup, GroupCode, updateName } from '../lib/idapi/user';
import { logger } from '../lib/serverSideLogger';
import { getConfiguration } from '../lib/getConfiguration';
import { trackMetric } from '../lib/trackMetric';

router.get('/agree/GRS', (req: Request, res: ResponseWithRequestState) => {
  const html = renderer('/agree/GRS', {
    requestState: res.locals,
    pageTitle: 'Jobs',
  });
  res.type('html').send(html);
});

router.post(
  '/agree/GRS',
  async (req: Request, res: ResponseWithRequestState) => {
    const state = res.locals;
    const { firstName, lastName } = req.body;

    const { returnUrl } = state.pageData;
    const { defaultReturnUri } = getConfiguration();
    const redirectUrl = returnUrl || defaultReturnUri;
    try {
      // When a jobs user is registering, we'd like to add them to the GRS group.
      // We only do this for users going through the welcome flow.
      //
      // Once they belong to this group, they aren't shown a confirmation page when-
      // they first visit the jobs site.
      //
      // If the SC_GU_U cookie exists, we try to add the user to the group.
      // If the cookie doesn't exist for some reason, we log the incident.

      const SC_GU_U = req.cookies.SC_GU_U;
      if (SC_GU_U) {
        if (firstName && lastName) {
          await updateName(firstName, lastName, req.ip, SC_GU_U);
        } else {
          logger.error(
            'No first or last name provided for Jobs user creation request.',
          );
        }
        await addToGroup(GroupCode.GRS, req.ip, SC_GU_U);
      } else {
        logger.error(
          'Failed to add the user to the GRS group or set their full name because the SC_GU_U cookie is not set.',
        );
      }

      trackMetric('JobsGRSGroupAgree::Success');

      return res.redirect(303, redirectUrl);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error);
      trackMetric('JobsGRSGroupAgree::Failure');
      return res.redirect(303, redirectUrl);
    }
  },
);

export default router.router;
