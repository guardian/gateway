import { getClientId } from '../lib/helper';

describe('getClientId', () => {
	it('should return undefined if no context is passed', () => {
		expect(getClientId()).toBeUndefined();
	});

	it('should return undefined if no target is passed', () => {
		expect(getClientId({})).toBeUndefined();
	});

	it('should return undefined if no clientId is passed', () => {
		expect(getClientId({ target: {} })).toBeUndefined();
	});

	it('should return the clientId if it is passed', () => {
		expect(getClientId({ target: { clientId: 'test' } })).toEqual('test');
	});
});
