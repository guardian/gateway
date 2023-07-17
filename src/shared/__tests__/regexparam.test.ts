import { parse } from '@/shared/lib/regexparam';

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

describe('regexparam#parse', () => {
	test('ensure lead slash is applied', () => {
		expect(parse('/')).toEqual(parse(''));
		expect(parse('/books')).toEqual(parse('books'));
		expect(parse('/books/:title')).toEqual(parse('books/:title'));
		expect(parse('/books/:title?')).toEqual(parse('books/:title?'));
		expect(parse('/books/*')).toEqual(parse('books/*'));
	});

	test('static single path', () => {
		const { pattern } = parse('/books');
		expect(pattern.test('/books')).toBe(true);
		expect(pattern.test('/books/')).toBe(true);
		expect(pattern.test('/books/123')).toBe(false);
		expect(pattern.test('/books/123/author')).toBe(false);
		expect(pattern.test('books/123')).toBe(false);
	});

	test('static multiple path', () => {
		const { pattern } = parse('/foo/bar');
		expect(pattern.test('/foo/bar')).toBe(true);
		expect(pattern.test('/foo/bar/')).toBe(true);
		expect(pattern.test('/foo/bar/baz')).toBe(false);
		expect(pattern.test('foo/bar')).toBe(false);
		expect(pattern.test('/foo')).toBe(false);
	});

	test('single path with param', () => {
		const { pattern } = parse('/books/:title');
		expect(pattern.test('/books/')).toBe(false);
		expect(pattern.test('/books/123')).toBe(true);
		expect(pattern.test('/books/123/')).toBe(true);
		expect(pattern.test('/books/123/author')).toBe(false);
		expect(pattern.test('books/123')).toBe(false);

		const search = pattern.exec('/books/123');
		expect(search?.[0]).toBe('/books/123');
		expect(search?.[1]).toEqual('123');
	});

	test('only param path', () => {
		const { pattern } = parse('/:title');
		expect(pattern.test('/123')).toBe(true);
		expect(pattern.test('/123/')).toBe(true);
		expect(pattern.test('/')).toBe(false);
		expect(pattern.test('/123/author')).toBe(false);
		expect(pattern.test('123')).toBe(false);

		const search = pattern.exec('/123');
		expect(search?.[0]).toBe('/123');
		expect(search?.[1]).toEqual('123');
	});

	test('multiple path with param', () => {
		const { pattern } = parse('/books/author/:name');
		expect(pattern.test('/books/author/luke')).toBe(true);
		expect(pattern.test('/books/author/luke/')).toBe(true);
		expect(pattern.test('/books/author/')).toBe(false);
		expect(pattern.test('/books/author/luke/age')).toBe(false);
		expect(pattern.test('books/author/luke')).toBe(false);

		const search = pattern.exec('/books/author/luke');
		expect(search?.[0]).toBe('/books/author/luke');
		expect(search?.[1]).toEqual('luke');
	});

	test('multiple path with param in the middle', () => {
		const { pattern } = parse('/books/:title/author');
		expect(pattern.test('/books/123/author')).toBe(true);
		expect(pattern.test('/books/123/author/')).toBe(true);
		expect(pattern.test('/books/author/')).toBe(false);
		expect(pattern.test('/books/123/author/luke')).toBe(false);
		expect(pattern.test('books/123/author')).toBe(false);

		const search = pattern.exec('/books/123/author');
		expect(search?.[0]).toBe('/books/123/author');
		expect(search?.[1]).toEqual('123');
	});

	test('path with multiple params', () => {
		const { pattern } = parse('/books/:title/:date');
		expect(pattern.test('/books/123/2020')).toBe(true);
		expect(pattern.test('/books/123/2020/')).toBe(true);
		expect(pattern.test('/books/123/')).toBe(false);
		expect(pattern.test('/books/123/2020/author')).toBe(false);
		expect(pattern.test('books/123/2020')).toBe(false);

		const search = pattern.exec('/books/123/2020');
		expect(search?.[0]).toBe('/books/123/2020');
		expect(search?.[1]).toEqual('123');
		expect(search?.[2]).toEqual('2020');
	});

	test('path with multiple params with param in the middle', () => {
		const { pattern } = parse('/books/:title/author/:name');
		expect(pattern.test('/books/123/author/luke')).toBe(true);
		expect(pattern.test('/books/123/author/luke/')).toBe(true);
		expect(pattern.test('/books/author/luke')).toBe(false);
		expect(pattern.test('/books/123/author/')).toBe(false);
		expect(pattern.test('books/123/author/luke')).toBe(false);

		const search = pattern.exec('/books/123/author/luke');
		expect(search?.[0]).toBe('/books/123/author/luke');
		expect(search?.[1]).toEqual('123');
		expect(search?.[2]).toEqual('luke');
	});

	test('path with param and suffix', () => {
		const { pattern } = parse('/books/:title.txt');
		expect(pattern.test('/books/123.txt')).toBe(true);
		expect(pattern.test('/books/123.txt/')).toBe(true);
		expect(pattern.test('/books/123.txt/author')).toBe(false);
		expect(pattern.test('books/123.txt')).toBe(false);

		const search = pattern.exec('/books/123.txt');
		expect(search?.[0]).toBe('/books/123.txt');
		expect(search?.[1]).toEqual('123');
	});

	test('path with param and multiple suffixes', () => {
		const { pattern } = parse('/books/:title.(txt|md)');
		expect(pattern.test('/books/123.txt')).toBe(true);
		expect(pattern.test('/books/123.md')).toBe(true);
		expect(pattern.test('/books/123.txt/')).toBe(true);
		expect(pattern.test('/books/123.md/')).toBe(true);
		expect(pattern.test('/books/123.txt/author')).toBe(false);
		expect(pattern.test('/books/123.md/author')).toBe(false);
		expect(pattern.test('books/123.txt')).toBe(false);
		expect(pattern.test('books/123.md')).toBe(false);

		const search = pattern.exec('/books/123.txt');
		expect(search?.[0]).toBe('/books/123.txt');
		expect(search?.[1]).toEqual('123');

		const search2 = pattern.exec('/books/123.md');
		expect(search2?.[0]).toBe('/books/123.md');
		expect(search2?.[1]).toEqual('123');
	});

	test('path with optional param', () => {
		const { pattern } = parse('/books/:title?');
		expect(pattern.test('/books/123')).toBe(true);
		expect(pattern.test('/books/')).toBe(true);
		expect(pattern.test('/books')).toBe(true);
		expect(pattern.test('/books/123/author')).toBe(false);
		expect(pattern.test('books/123')).toBe(false);

		const search = pattern.exec('/books/123');
		expect(search?.[0]).toBe('/books/123');
		expect(search?.[1]).toEqual('123');
	});

	test('path with required param and optional param', () => {
		const { pattern } = parse('/books/:title/:author?');
		expect(pattern.test('/books/123/luke')).toBe(true);
		expect(pattern.test('/books/123')).toBe(true);
		expect(pattern.test('/books/123/')).toBe(true);
		expect(pattern.test('/books/123/luke/author')).toBe(false);
		expect(pattern.test('books/123/luke')).toBe(false);

		const search = pattern.exec('/books/123/luke');
		expect(search?.[0]).toBe('/books/123/luke');
		expect(search?.[1]).toEqual('123');
		expect(search?.[2]).toEqual('luke');
	});

	test('path with only optional param', () => {
		const { pattern } = parse('/:title?');
		expect(pattern.test('/123')).toBe(true);
		expect(pattern.test('/')).toBe(true);
		expect(pattern.test('')).toBe(true);
		expect(pattern.test('/123/author')).toBe(false);
		expect(pattern.test('123')).toBe(false);

		const search = pattern.exec('/123');
		expect(search?.[0]).toBe('/123');
		expect(search?.[1]).toEqual('123');
	});

	test('path with multiple optional params and required params', () => {
		const { pattern } = parse('/books/:title/:author?/:date?');
		expect(pattern.test('/books/123/luke/2020')).toBe(true);
		expect(pattern.test('/books/123/luke')).toBe(true);
		expect(pattern.test('/books/123')).toBe(true);
		expect(pattern.test('/books/123/')).toBe(true);
		expect(pattern.test('/books/123/luke/2020/author')).toBe(false);
		expect(pattern.test('books/123/luke/2020')).toBe(false);

		const search = pattern.exec('/books/123/luke/2020');
		expect(search?.[0]).toBe('/books/123/luke/2020');
		expect(search?.[1]).toEqual('123');
		expect(search?.[2]).toEqual('luke');
		expect(search?.[3]).toEqual('2020');

		const search2 = pattern.exec('/books/123/luke');
		expect(search2?.[0]).toBe('/books/123/luke');
		expect(search2?.[1]).toEqual('123');
		expect(search2?.[2]).toEqual('luke');
		expect(search2?.[3]).toBeUndefined();

		const search3 = pattern.exec('/books/123');
		expect(search3?.[0]).toBe('/books/123');
		expect(search3?.[1]).toEqual('123');
		expect(search3?.[2]).toBeUndefined();
		expect(search3?.[3]).toBeUndefined();
	});

	test('path with wildcard', () => {
		const { pattern } = parse('/books/*');
		expect(pattern.test('/books/123')).toBe(true);
		expect(pattern.test('/books/123/')).toBe(true);
		expect(pattern.test('/books/123/author')).toBe(true);
		expect(pattern.test('/books/123/author/luke')).toBe(true);
		expect(pattern.test('/books/123/author/luke/')).toBe(true);
		expect(pattern.test('/books/')).toBe(true);
		expect(pattern.test('/books')).toBe(false);
		expect(pattern.test('books/123')).toBe(false);
		expect(pattern.test('/')).toBe(false);
		expect(pattern.test('/book')).toBe(false);

		const search = pattern.exec('/books/123/author/luke');
		expect(search?.[0]).toBe('/books/123/author/luke');
		expect(search?.[1]).toEqual('123/author/luke');
	});

	test('only wildcard', () => {
		const { pattern } = parse('*');
		expect(pattern.test('/books/123')).toBe(true);
		expect(pattern.test('/books/123/')).toBe(true);
		expect(pattern.test('/books/123/author')).toBe(true);
		expect(pattern.test('/books/123/author/luke')).toBe(true);
		expect(pattern.test('/books/123/author/luke/')).toBe(true);
		expect(pattern.test('/books/')).toBe(true);
		expect(pattern.test('/books')).toBe(true);
		expect(pattern.test('/')).toBe(true);
		expect(pattern.test('/book')).toBe(true);
		expect(pattern.test('books/123')).toBe(false);

		const search = pattern.exec('/books/123/author/luke');
		expect(search?.[0]).toBe('/books/123/author/luke');
		expect(search?.[1]).toEqual('books/123/author/luke');
	});
});
