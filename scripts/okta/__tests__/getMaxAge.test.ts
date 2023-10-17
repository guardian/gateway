import { getMaxAge } from '../lib/helper';

describe('getMaxAge', () => {
	it('should return undefined if no context is passed', () => {
		expect(getMaxAge()).toBeUndefined();
	});

	it('should return undefined if no authentication object is passed', () => {
		expect(getMaxAge({})).toBeUndefined();
	});

	it('should return undefined if no request object is passed', () => {
		expect(getMaxAge({ authentication: {} })).toBeUndefined();
	});

	it('should return undefined if no maxAge is passed', () => {
		expect(getMaxAge({ authentication: { request: {} } })).toBeUndefined();
	});

	it('should return maxAge if it is 0', () => {
		expect(getMaxAge({ authentication: { request: { max_age: 0 } } })).toEqual(
			0,
		);
	});

	it('should return maxAge if it is -1', () => {
		expect(getMaxAge({ authentication: { request: { max_age: -1 } } })).toEqual(
			-1,
		);
	});

	it('should return maxAge if it is greater than 0', () => {
		expect(
			getMaxAge({ authentication: { request: { max_age: 100 } } }),
		).toEqual(100);
	});
});
