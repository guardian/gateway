import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getApps } from '../lib/okta/api/apps';

router.get('/', async (req: Request, res: ResponseWithRequestState) => {
	const apps = await getApps();

	const appsToShow = [
		{
			name: 'Gateway',
			labels: ['profile'],
		},
		{
			name: 'The Guardian',
			labels: ['theguardian'],
		},
		{
			name: 'Manage My Account',
			labels: ['manage'],
		},
		{
			name: 'Guardian Jobs',
			labels: ['jobs_site'],
			clientId: 'jobs',
		},
		{
			name: 'Editions',
			labels: ['editions_pressreader'],
		},
		{
			name: 'Support',
			labels: ['support'],
		},
		{
			name: 'Guardian App',
			labels: ['ios_live_app', 'android_live_app'],
			suffix: ['iOS', 'Android'],
		},
		{
			name: 'Feast App',
			labels: ['ios_feast_app', 'android_feast_app'],
			suffix: ['iOS', 'Android'],
		},
	];

	const signInLinks = appsToShow.map((app) => {
		const signInLinks = app.labels.map((label, index) => {
			const clientIdParam = app.clientId ? `&clientId=${app.clientId}` : '';
			const appClientId = apps.find((a) => a.label === label)?.id;

			const suffix = app.suffix ? ` (${app.suffix[index]})` : '';

			return `<a href="/signin?appClientId=${appClientId}${clientIdParam}">Sign-in${suffix}</a>`;
		});

		return `<li><b>${app.name}<b>: ${signInLinks.join(' | ')}</li>`;
	});

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
					${signInLinks.join('')}
				</ul>
				<h2>Other Routes</h2>
				<ul>
					<li><a href="/signout">Sign Out</a></li>
					<li><a href="/delete">Delete Account</a></li>
					<li><a href="/maintenance">Maintenance</a></li>
				</ul>
			</body>
		</html>
	`;

	return res.type('html').send(html);
});

export default router.router;
