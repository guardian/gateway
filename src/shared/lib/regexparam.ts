/* eslint-disable functional/immutable-data */

/**
 * Modified from https://github.com/lukeed/regexparam
 *
 * The MIT License (MIT)
 *
 * Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

/**
 * @name parse
 * @description Parse a path string (e.g. /users/:id) into a RegExp and keys
 *
 * Parse a route pattern into an equivalent RegExp pattern.
 * Also collects the names of pattern's parameters as a keys array.
 *
 * Returns a { pattern } object, where pattern is always a RegExp instance.
 *
 * we can't use the library directly while we support legacy browsers as we get a
 * export 'parse' (imported as 'parse') was not found in 'regexparam' (module has no exports)
 * error
 *
 * @param str path string to match
 * @param loose Should the RegExp match URLs that are longer than the str pattern itself?
 * @returns `{ pattern }` object, where pattern is always a RegExp instance.
 */
export function parse(str: string, loose?: boolean) {
	// eslint-disable-next-line functional/no-let
	let tmp,
		pattern = '';
	const arr = str.split('/');
	arr[0] || arr.shift();

	while ((tmp = arr.shift())) {
		const current = tmp[0];
		if (current === '*') {
			pattern += '/(.*)';
		} else if (current === ':') {
			const optional = tmp.indexOf('?', 1);
			const ext = tmp.indexOf('.', 1);
			pattern += !!~optional && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
			if (!!~ext)
				pattern += (!!~optional ? '?' : '') + '\\' + tmp.substring(ext);
		} else {
			pattern += '/' + tmp;
		}
	}

	return {
		pattern: new RegExp('^' + pattern + (loose ? '(?=$|/)' : '/?$'), 'i'),
	};
}
