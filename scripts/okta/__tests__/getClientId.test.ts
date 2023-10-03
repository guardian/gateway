import { getClientId } from '../lib/helper';

describe('getClientId', () => {
	it('should return undefined if no context is passed', () => {
		expect(getClientId()).toBeUndefined();
	});

	it('should return undefined if no target is passed', () => {
		expect(getClientId({})).toBeUndefined();
	});

	it('should return undefined if no clientId is passed - okta identity classic', () => {
		expect(getClientId({ target: {} })).toBeUndefined();
	});

	it('should return the clientId if it is passed - okta identity classic', () => {
		expect(getClientId({ target: { clientId: 'test' } })).toEqual('test');
	});

	it('should return undefined if no clientId is passed - okta identity engine', () => {
		expect(getClientId({ app: {} })).toBeUndefined();
		expect(getClientId({ app: { value: {} } })).toBeUndefined();
	});

	it('should return the clientId if it is passed - okta identity engine', () => {
		expect(getClientId({ app: { value: { id: 'test' } } })).toEqual('test');
	});
});
