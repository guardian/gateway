import { Request } from 'express';
import { rateLimitedTypedRouter as router } from '@/server/lib/typedRoutes';
import { ResponseWithRequestState } from '@/server/models/Express';
import { getApps } from '../lib/okta/api/apps';
import { getConfiguration } from '@/server/lib/getConfiguration';

const { stage } = getConfiguration();

const getIframedPath = (page: string): string => {
	if (page === 'register') {
		return '/iframed/register/email';
	}
	if (page === 'passcode') {
		return '/iframed/passcode';
	}
	return '/iframed/signin';
};

if (stage === 'DEV') {
	router.router.get(
		'/iframe-harness.js',
		(_: Request, res: ResponseWithRequestState) => {
			const script = `
				const frame = document.getElementById('frame');
				const log = document.getElementById('log');
	
				const appendLog = (message) => {
					if (!log) {
						return;
					}
					log.textContent += '\\n' + new Date().toISOString() + ' ' + message;
				};
	
				window.addEventListener('message', (event) => {
					if (!event.data || event.data.context !== 'supporterOnboarding') {
						return;
					}
	
					const { type, value } = event.data;
					appendLog('message type=' + type + ' value=' + JSON.stringify(value));
	
					if (type === 'iframeHeightChange' && frame) {
						const nextHeight = typeof value === 'number' ? value : Number(value);
						if (!Number.isNaN(nextHeight) && Number.isFinite(nextHeight) && nextHeight > 0) {
							frame.style.height = nextHeight + 'px';
							frame.setAttribute('height', String(Math.round(nextHeight)));
							appendLog('applied iframe height=' + Math.round(nextHeight));
						}
					}
				});
		`;

			return res.type('application/javascript').send(script);
		},
	);

	router.router.get(
		'/iframe-harness',
		(req: Request, res: ResponseWithRequestState) => {
			const page =
				typeof req.query.page === 'string' ? req.query.page : 'signin';
			const appClientId =
				typeof req.query.appClientId === 'string' ? req.query.appClientId : '';
			const prepopulateEmail =
				typeof req.query.prepopulateEmail === 'string'
					? req.query.prepopulateEmail
					: '';

			const iframePath = getIframedPath(page);
			const iframeQuery = new URLSearchParams();
			if (appClientId) {
				iframeQuery.set('appClientId', appClientId);
			}
			if (prepopulateEmail) {
				iframeQuery.set('prepopulateEmail', prepopulateEmail);
			}

			const iframeSrc = `${iframePath}${iframeQuery.toString() ? `?${iframeQuery.toString()}` : ''}`;

			const html = `
				<!DOCTYPE html>
				<html lang="en">
					<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
						<title>Iframe Harness</title>
						<style>
							body { font-family: sans-serif; margin: 16px; }
							#frame { width: 100%; border: 1px solid #dcdcdc; height: 1px; min-height: 0; }
							#log { margin-top: 12px; white-space: pre-wrap; background: #f6f6f6; padding: 12px; border-radius: 4px; }
						</style>
					</head>
					<body>
						<h1>Iframe Harness</h1>
						<p>Testing page: <b>${iframePath}</b></p>
						<p>Iframe source: <code>${iframeSrc}</code></p>
						<iframe
							id="frame"
							src="${iframeSrc}"
							title="Gateway iframe harness"
						></iframe>
						<div id="log">Waiting for iframe events...</div>
						<script src="/iframe-harness.js"></script>
					</body>
				</html>
			`;

			return res.type('html').send(html);
		},
	);
}

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

	const iframeHarnessLink =
		stage === 'DEV'
			? '<li><a href="/iframe-harness?page=signin&appClientId=maj">Iframe Harness (Sign-in MAJ)</a> | <a href="/iframe-harness?page=register&appClientId=maj">Iframe Harness (Register MAJ)</a></li>'
			: '';

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
					<li><a href="/signin?newOnboardingFlow=true">New Onboarding Flow</a>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<a href="/signin">Old Onboarding Flow</a></li>
					<li><a href="/iframed/signin">Iframed Sign-in</a> | <a href="/iframed/signin?appClientId=maj">Iframed Sign-in (Multiple Account)</a></li>
					<li><a href="/iframed/register/email">Iframed Register</a> | <a href="/iframed/register/email?appClientId=maj">Iframed Register (Multiple Account)</a></li>
					${iframeHarnessLink}
				</ul>
			</body>
		</html>
	`;

	return res.type('html').send(html);
});

export default router.router;
