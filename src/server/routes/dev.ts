import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getApps } from '../lib/okta/api/apps';

router.get('/', async (req: Request, res: ResponseWithRequestState) => {
	const apps = await getApps();

	const clientSignInRoutes = apps.map(
		(app) =>
			`<li><a href="/signin?appClientId=${app.id}${app.label === 'jobs_site' ? '&clientId=jobs' : ''}">${app.label}</a></li>`,
	);

	const html = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Dev Routes</title>
			</head>
			<body>
				<h1>Development Routes</h1>
				<h2>Sign-in / Registration</h2>
				<ul>
					${clientSignInRoutes.join('')}
				</ul>
			</body>
		</html>
	`;

	return res.type('html').send(html);
});

export default router.router;
