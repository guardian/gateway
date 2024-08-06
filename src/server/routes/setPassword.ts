import type { Request } from 'express';
import { setPasswordController } from '@/server/controllers/changePassword';
import { checkPasswordTokenController } from '@/server/controllers/checkPasswordToken';
import { sendEmailInOkta as sendResetPasswordEmailInOktaController } from '@/server/controllers/sendChangePasswordEmail';
import { readEmailCookie } from '@/server/lib/emailCookie';
import { handleAsyncErrors } from '@/server/lib/expressWrappers';
import handleRecaptcha from '@/server/lib/recaptcha';
import { renderer } from '@/server/lib/renderer';
import { mergeRequestState } from '@/server/lib/requestState';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import type { ResponseWithRequestState } from '@/server/models/Express';

// set password complete page
router.get(
	'/set-password/complete',
	(req: Request, res: ResponseWithRequestState) => {
		const email = readEmailCookie(req);

		const html = renderer('/set-password/complete', {
			requestState: mergeRequestState(res.locals, {
				pageData: {
					email,
				},
			}),
			pageTitle: 'Password Set',
		});
		return res.type('html').send(html);
	},
);

// resend "create (set) password" email page
router.get(
	'/set-password/resend',
	(_: Request, res: ResponseWithRequestState) => {
		const html = renderer('/set-password/resend', {
			pageTitle: 'Resend Create Password Email',
			requestState: res.locals,
		});
		res.type('html').send(html);
	},
);

// set password page session expired
router.get(
	'/set-password/expired',
	(_: Request, res: ResponseWithRequestState) => {
		const html = renderer('/set-password/expired', {
			pageTitle: 'Resend Create Password Email',
			requestState: res.locals,
		});
		res.type('html').send(html);
	},
);

// POST handler for resending "create (set) password" email
router.post(
	'/set-password/resend',
	handleRecaptcha,
	handleAsyncErrors(async (req: Request, res: ResponseWithRequestState) => {
		return await sendResetPasswordEmailInOktaController(req, res);
	}),
);

// email sent page
router.get(
	'/set-password/email-sent',
	(req: Request, res: ResponseWithRequestState) => {
		const state = res.locals;

		const email = readEmailCookie(req);

		const html = renderer('/set-password/email-sent', {
			pageTitle: 'Check Your Inbox',
			requestState: mergeRequestState(state, {
				pageData: {
					email,
					resendEmailAction: '/set-password/resend',
					changeEmailPage: '/set-password/resend',
				},
			}),
		});
		res.type('html').send(html);
	},
);

// set password page with token check
// The below route must be defined below the other GET /set-password/* routes otherwise the other routes will fail
router.get(
	'/set-password/:token',
	checkPasswordTokenController('/set-password', 'Create Password'),
);

// POST handler for set password page to set password
router.post(
	'/set-password/:token',
	setPasswordController(
		'/set-password',
		'Create Password',
		'/set-password/complete',
	),
);

export default router.router;
