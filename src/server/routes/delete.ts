import { Request } from 'express';
import { ResponseWithRequestState } from '@/server/models/Express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { renderer } from '@/server/lib/renderer';

router.get('/delete', (req: Request, res: ResponseWithRequestState) => {
	const html = renderer('/delete', {
		requestState: res.locals,
		pageTitle: 'Account Deletion',
	});
	res.type('html').send(html);
});

router.get(
	'/delete/complete',
	(req: Request, res: ResponseWithRequestState) => {
		const html = renderer('/delete/complete', {
			requestState: res.locals,
			pageTitle: 'Account Deletion Complete',
		});
		res.type('html').send(html);
	},
);

export default router.router;
