import type { Request } from 'express';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { changeEmail } from '@/server/lib/idapi/user';
import { renderer } from '@/server/lib/renderer';
import { mergeRequestState } from '@/server/lib/requestState';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import type { ResponseWithRequestState } from '@/server/models/Express';

const { accountManagementUrl } = getConfiguration();

router.get(
	'/change-email/complete',
	(_: Request, res: ResponseWithRequestState) => {
		const html = renderer('/change-email/complete', {
			pageTitle: 'Change Email',
			requestState: mergeRequestState(res.locals, {
				pageData: {
					accountManagementUrl,
				},
			}),
		});
		return res.type('html').send(html);
	},
);

router.get(
	'/change-email/:token',
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		const { token } = req.params;

		try {
			await changeEmail(token, req.ip, res.locals.requestId);

			trackMetric('ChangeEmail::Success');

			return res.redirect(303, '/change-email/complete');
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error, {
				request_id: res.locals.requestId,
			});

			trackMetric('ChangeEmail::Failure');

			const html = renderer('/change-email/error', {
				pageTitle: 'Change Email',
				requestState: mergeRequestState(res.locals, {
					pageData: {
						accountManagementUrl,
					},
				}),
			});
			return res.type('html').send(html);
		}
	}),
);

export default router.router;
