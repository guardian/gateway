import { renderer } from '@/server/lib/renderer';
import { ResponseWithRequestState } from '@/server/models/Express';
import { Request, Router } from 'express';
import { mergeRequestState } from '@/server/lib/requestState';
import { readEmailCookie } from '../lib/emailCookie';
import { trackMetric } from '../lib/trackMetric';

const router = Router();

// /verify-email is just a reskinned reset password page, because to prevent account hijacking
// attacks, we require the user to reset their password before their email is verified.
// Email verification happens automatically when the user resets their password.
// To provide backwards compatibility with old systems, such as User Admin, which send the
// user a link to /verify-email/:token, we support an optional token porameter in the URL,
// but ignore it.
router.get(
	'/verify-email/:token?',
	(req: Request, res: ResponseWithRequestState) => {
		// Track a metric to see how many users are hitting this page
		trackMetric('VerifyEmailPage::Accessed');

		// If the user has a token in the URL, redirect them to the page without the token
		if (req.params.token) {
			res.redirect('/verify-email');
			return;
		}

		const html = renderer('/verify-email', {
			pageTitle: 'Verify Email',
			requestState: mergeRequestState(res.locals, {
				pageData: {
					email: readEmailCookie(req),
				},
			}),
		});

		return res.type('html').send(html);
	},
);

export default router;
