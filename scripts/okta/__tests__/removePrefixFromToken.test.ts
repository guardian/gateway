import { removePrefixFromToken } from '../lib/helper';

describe('removePrefixFromToken', () => {
	it('should return token as is if no prefix is passed', () => {
		expect(removePrefixFromToken('test')).toEqual('test');
	});

	it('should return token without prefix if prefix is passed - al_', () => {
		expect(removePrefixFromToken('al_test')).toEqual('test');
	});

	it('should return token without prefix if prefix is passed - il_', () => {
		expect(removePrefixFromToken('il_test')).toEqual('test');
	});

	it('should return undefined if no token is passed', () => {
		expect(removePrefixFromToken('')).toBeUndefined();
		expect(removePrefixFromToken(undefined)).toBeUndefined();
		expect(removePrefixFromToken(null)).toBeUndefined();
	});
});
