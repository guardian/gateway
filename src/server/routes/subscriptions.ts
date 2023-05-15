import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import {
  isValidEmailType,
  parseSubscriptionData,
  makeSubscriptionRequest,
} from '@/server/lib/idapi/subscriptions';
import { renderer } from '@/server/lib/renderer';
import { mergeRequestState } from '@/server/lib/requestState';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import {
  SubscriptionAction,
  subscriptionActionName,
} from '@/shared/lib/subscriptions';

const { accountManagementUrl } = getConfiguration();

const handler = (action: SubscriptionAction) =>
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { emailType, data, token } = req.params;

    try {
      if (!isValidEmailType(emailType)) {
        throw new Error('Invalid email type');
      }

      const subscriptionData = parseSubscriptionData(data);

      await makeSubscriptionRequest(
        action,
        emailType,
        subscriptionData,
        token,
        req.ip,
        res.locals.requestId,
      );

      trackMetric(`${subscriptionActionName(action)}::Success`);

      const html = renderer(`/${action}/success`, {
        requestState: mergeRequestState(res.locals, {
          pageData: {
            accountManagementUrl,
          },
        }),
        pageTitle: `${subscriptionActionName(action)} Confirmation`,
      });

      return res.type('html').send(html);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
        request_id: res.locals.requestId,
      });

      trackMetric(`${subscriptionActionName(action)}::Failure`);

      const html = renderer(`/${action}/error`, {
        requestState: mergeRequestState(res.locals, {
          pageData: {
            accountManagementUrl,
          },
        }),
        pageTitle: `${subscriptionActionName(action)} Error`,
      });

      return res.type('html').send(html);
    }
  });

router.get('/unsubscribe/:emailType/:data/:token', handler('unsubscribe'));
router.get('/subscribe/:emailType/:data/:token', handler('subscribe'));

export default router.router;