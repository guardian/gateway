import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { renderer } from '@/server/lib/renderer';
import { mergeRequestState } from '@/server/lib/requestState';
import { getConfiguration } from '@/server/lib/getConfiguration';
import { changeEmail } from '@/server/lib/idapi/user';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import { logger } from '@/server/lib/serverSideLogger';
import { trackMetric } from '@/server/lib/trackMetric';

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
			await changeEmail(token, req.ip);

			trackMetric('ChangeEmail::Success');

			return res.redirect(303, '/change-email/complete');
		} catch (error) {
			logger.error(`${req.method} ${req.originalUrl}  Error`, error);

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
