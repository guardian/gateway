import { getThirdPartyClientId } from '../lib/helper';

describe('getThirdPartyClientId', () => {
	it('should return undefined if no context is passed', () => {
		expect(getThirdPartyClientId()).toBeUndefined();
	});

	it('should return undefined if no target is passed', () => {
		expect(getThirdPartyClientId({})).toBeUndefined();
	});

	it('should return undefined if no label is passed - identity classic', () => {
		expect(getThirdPartyClientId({ target: {} })).toBeUndefined();
	});

	it('should return the third party client id if it is passed - identity classic', () => {
		expect(getThirdPartyClientId({ target: { label: 'jobs_site' } })).toEqual(
			'jobs',
		);
	});

	it('should return undefined if no label is passed - identity engine', () => {
		expect(getThirdPartyClientId({ app: {} })).toBeUndefined();
		expect(getThirdPartyClientId({ app: { value: {} } })).toBeUndefined();
	});

	it('should return the third party client id if it is passed - identity engine', () => {
		expect(
			getThirdPartyClientId({ app: { value: { label: 'jobs_site' } } }),
		).toEqual('jobs');
	});
});
