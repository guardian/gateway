import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import {
  isValidEmailType,
  parseUnsubscribeData,
  unsubscribe,
} from '@/server/lib/idapi/unsubscribe';
import { renderer } from '@/server/lib/renderer';
import { mergeRequestState } from '@/server/lib/requestState';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { logger } from '@/server/lib/serverSideLogger';

const { accountManagementUrl } = getConfiguration();

router.get(
  '/unsubscribe/:emailType/:data/:token',
  handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
    const { emailType, data, token } = req.params;

    try {
      if (!isValidEmailType(emailType)) {
        throw new Error('Invalid email type');
      }

      const unsubscribeData = parseUnsubscribeData(data);

      await unsubscribe(
        emailType,
        unsubscribeData,
        token,
        req.ip,
        res.locals.requestId,
      );

      const html = renderer('/unsubscribe/success', {
        requestState: mergeRequestState(res.locals, {
          pageData: {
            accountManagementUrl,
          },
        }),
        pageTitle: 'Unsubscribe Confirmation',
      });

      return res.type('html').send(html);
    } catch (error) {
      logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
        request_id: res.locals.requestId,
      });

      const html = renderer('/unsubscribe/error', {
        requestState: mergeRequestState(res.locals, {
          pageData: {
            accountManagementUrl,
          },
        }),
        pageTitle: 'Unsubscribe Error',
      });

      return res.type('html').send(html);
    }
  }),
);

export default router.router;
