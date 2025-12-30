/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable functional/immutable-data */
/* eslint-disable no-console */
/* eslint-disable functional/no-let */
// Very simple mocking server for mimicking IDAPI

/* eslint-env node */
const bodyParser = require('body-parser');
const express = require('express');
const PORT = 9000;

const DEFAULT_RESPONSE = {
	status: 500,
	payload: 'Mock Server Error: No mock requests in queue',
};

const app = express();

const responses = [];
const permanent = new Map();
let permanentPatterns = [];
let permanentBodyMocks = [];

// return the last matching pattern (most recently registered) so that you can override mocks
const findPattern = (path) =>
	[...permanentPatterns]
		.reverse()
		.find(({ pattern }) => new RegExp(pattern).test(path));

// Helper to check if request body matches the bodyMatch propert(y/ies)
const matchesBody = (requestBody, bodyMatch) => {
	if (!bodyMatch || typeof bodyMatch !== 'object') return false;

	const checkMatch = (actual, expected) => {
		if (typeof expected !== 'object' || expected === null) {
			return actual === expected;
		}
		if (typeof actual !== 'object' || actual === null) {
			return false;
		}
		return Object.keys(expected).every((key) =>
			checkMatch(actual[key], expected[key]),
		);
	};

	return checkMatch(requestBody, bodyMatch);
};

// Find a body mock that matches both path and request body
const findBodyMock = (path, requestBody) =>
	permanentBodyMocks.find(
		(mock) => mock.path === path && matchesBody(requestBody, mock.bodyMatch),
	);

const payloads = [];

app.use(
	bodyParser.json({
		strict: false,
		type: ['application/json', 'application/ion+json', 'application/*+json'],
	}),
);
app.use(express.urlencoded({ extended: true }));

app.get('/healthcheck', (_, res) => {
	console.log('healthcheck OK');
	res.sendStatus(204);
});

// Reset all mocks, including permanent
app.get('/mock/purge', (_, res) => {
	console.log('purging all mocks');
	responses.length = 0;
	permanent.clear();
	permanentPatterns = [];
	permanentBodyMocks = [];
	payloads.length = 0;
	res.sendStatus(204);
});

// Push mock onto mock stack
app.post('/mock', (req, res) => {
	const headers = {};
	Object.keys(req.headers).forEach((key) => {
		if (key.startsWith('x-header-')) {
			const headerName = key.replace('x-header-', '');
			headers[headerName] = req.headers[key];
		}
	});
	responses.unshift({
		status: parseInt(req.get('X-status', 10)),
		payload: req.body,
		headers: Object.keys(headers).length > 0 ? headers : undefined,
	});
	res.sendStatus(204);
});

// Mock an endpoint with a pattern
app.post('/mock/permanent-pattern', (req, res) => {
	const pattern = req.body || {};
	if (pattern.status) {
		pattern.status = parseInt(pattern.status, 10);
	}
	permanentPatterns.push(pattern);
	res.sendStatus(204);
});

// Always mock supplied endpoint
app.post('/mock/permanent', (req, res) => {
	const { path, body: payload, status = 200 } = req.body || {};
	console.log(
		`[MOCK SERVER] Registering permanent mock for path: "${path}" with status: ${status}`,
	);
	permanent.set(path, { payload, status: parseInt(status, 10) });
	res.sendStatus(204);
});

// Mock endpoint with path + request body matching
app.post('/mock/permanent-body', (req, res) => {
	const { path, bodyMatch, body: payload, status = 200 } = req.body || {};
	console.log(
		`[MOCK SERVER] Registering permanent-body mock for path: "${path}" with bodyMatch:`,
		JSON.stringify(bodyMatch),
	);
	permanentBodyMocks.push({
		path,
		bodyMatch,
		payload,
		status: parseInt(status, 10),
	});
	res.sendStatus(204);
});

// Return last POST or PATCH'd request payload
app.get('/mock/payload', (_, res) => {
	res.json(payloads[payloads.length - 1]);
});

// Return all POST or PATCH'd request payloads
app.get('/mock/payloads', (_, res) => {
	res.json(payloads);
});

// For any request, if permanent, return permanent mock, otherwise pop from mock stack.
app.all('/{*catchAll}', (req, res) => {
	const origin = req.header('Origin');
	if (origin) {
		res.set('Access-Control-Allow-Origin', origin);
	}

	const { method } = req;
	if (method === 'POST' || method === 'PATCH') {
		payloads.push(req.body);
	}

	const bodyMock = findBodyMock(req.path, req.body);
	if (bodyMock) {
		const { status, payload } = bodyMock;
		res.status(status).json(payload);
		console.log(`Mocking (body match) for ${req.path}: ${status}`);
		return;
	}

	if (permanent.has(req.path)) {
		const { status, payload } = permanent.get(req.path);
		res.status(status).json(payload);
		console.log(`Mocking: ${req.originalUrl}: ${status}`);
		return;
	}

	const patternResponse = findPattern(req.path);
	if (patternResponse) {
		const { status, body, pattern } = patternResponse;
		res.status(status).json(body);
		console.log(`Mocking pattern (${pattern}): ${req.originalUrl}: ${status}`);
		return;
	}

	if (responses.length === 0) {
		console.log(`No mock found for ${req.path}, returning default 500 error`);
		res.status(DEFAULT_RESPONSE.status).json(DEFAULT_RESPONSE.body);
	} else {
		const response = responses.pop();
		const { status, payload, headers } = response;
		if (headers) {
			Object.entries(headers).forEach(([key, value]) => {
				res.set(key, value);
			});
		}
		console.log(`Stack-based mock matched for ${req.path}: ${status}`);
		res.status(status).json(payload);
	}
});

app.listen(PORT);
console.log('mock server running on port:', PORT);
