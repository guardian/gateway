import { default as express, Express } from 'express';
import { applyMiddleware } from '@/server/lib/middleware';

const createServer = (): Express => {
	const server: Express = express();
	// This is set to true to allow Express to read IP address values from
	// X-Forwarded-For header values (cf. https://expressjs.com/en/guide/behind-proxies.html)
	// This is necessary for accurately logging the IP address in rate limiter calls.
	server.set('trust proxy', true);

	/**
	 * Essentially express query parameter parsing will convert a value of a query parameter
	 * into an array if it sees multiple keys for that parameter.
	 * e.g.
	 *
	 * `?foo=bar&foo=baz&hello=world`
	 *
	 * would get parsed into
	 *
	 * ```javascript
	 * {
	 *   foo: ['bar', 'baz'],
	 *   hello: 'world'
	 * }
	 * ```
	 *
	 * In Gateway we don’t use duplicate query parameters and they should never exist.
	 *
	 * By default, express will use https://www.npmjs.com/package/qs to parse query params,
	 * which is more powerful than what we need (called 'extended' in the express docs, see
	 * https://expressjs.com/en/api.html#app.settings.table).
	 *
	 * Even the "simple" mode in express uses node's querystring api doesn't work.
	 * This will also parse duplicate query params into an array, which is not what we want,
	 * as shown by the example in:
	 * https://nodejs.org/api/querystring.html#querystringparsestr-sep-eq-options
	 *
	 * However, we can use a custom query parser to use the native `URLSearchParams` API,
	 * which will parse duplicate query params into the last value, which is exactly what we want.
	 * So that `?foo=bar&foo=baz&hello=world` => `{ foo: 'baz', hello: 'world' }`.
	 *
	 * This can be tested in a node repl or browser console by running:
	 * ```js
	 * Object.fromEntries(new URLSearchParams(`foo=bar&foo=baz&hello=world`).entries())
	 * ```
	 * which returns the expected result.
	 */
	server.set('query parser', (str: string) =>
		Object.fromEntries(new URLSearchParams(str).entries()),
	);
	applyMiddleware(server);
	return server;
};

export default createServer;
